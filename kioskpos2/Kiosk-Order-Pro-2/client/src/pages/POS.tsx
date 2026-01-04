import { useState, useMemo } from "react";
import { KioskLayout } from "@/components/KioskLayout";
import { useMenu, useCreateOrder, useSettings } from "@/hooks/use-kiosk";
import { MenuCard } from "@/components/MenuCard";
import { MenuItem } from "@shared/schema";
import { 
  Search, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, 
  CheckCircle2, Printer, Send, ShoppingBag, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function POS() {
  const { data: menuItems = [] } = useMenu();
  const { data: settings } = useSettings();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Card" | "UPI">("Cash");
  const [orderNote, setOrderNote] = useState("");
  const [lastOrder, setLastOrder] = useState<any>(null); // For success screen

  // Filter Menu
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(i => i.category || "General"));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, selectedCategory]);

  // Cart Logic
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.menuItem.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuItem.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    createOrder({
      totalAmount: cartTotal,
      paymentMode,
      notes: orderNote,
      items: cart.map(i => ({
        menuItemId: i.menuItem.id,
        itemName: i.menuItem.name,
        quantity: i.quantity,
        price: i.menuItem.price
      }))
    }, {
      onSuccess: (data) => {
        setLastOrder(data);
        setCart([]);
        setIsPaymentOpen(false);
        setOrderNote("");
        toast({ title: "Order placed successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to place order", variant: "destructive" });
      }
    });
  };

  // Printing & WhatsApp Logic
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(settings?.shopName || "Kiosk POS", 14, 22);
    doc.setFontSize(10);
    doc.text(settings?.address || "", 14, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 35);
    doc.setFontSize(14);
    doc.text(`ORDER #${lastOrder.id}`, 14, 45);
    
    // Items Table
    const tableData = lastOrder.items.map((item: any) => [
      item.itemName,
      item.quantity.toString(),
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 112, 67] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.text(`TOTAL AMOUNT: Rs. ${lastOrder.totalAmount.toFixed(2)}`, 14, finalY + 15);
    doc.setFontSize(10);
    doc.text("Thank you for your order!", 14, finalY + 25);

    doc.save(`receipt-order-${lastOrder.id}.pdf`);
    toast({ title: "Receipt downloaded successfully" });
  };

  const handleWhatsApp = () => {
    if (!settings?.chefNumber) {
      toast({ title: "Chef number not configured in settings", variant: "destructive" });
      return;
    }

    const itemsList = lastOrder.items.map((i: any) => 
      `- ${i.itemName} x${i.quantity}`
    ).join('\n');

    const message = `New Order #${lastOrder.id}\n\n${itemsList}\n\nTotal: ₹${lastOrder.totalAmount}\nNote: ${lastOrder.notes || "None"}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${settings.chefNumber}?text=${encodedMessage}`, '_blank');
  };

  // If order success, show success screen
  if (lastOrder) {
    return (
      <KioskLayout>
        {/* Hidden Print Receipt Template */}
        <div id="receipt-print-area" className="hidden print:block p-4 font-mono text-black bg-white">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold uppercase">{settings?.shopName}</h2>
            <p className="text-sm">{settings?.address}</p>
            <p className="text-xs mt-2">{new Date().toLocaleString()}</p>
            <p className="font-bold mt-2 border-b border-black pb-2">ORDER #{lastOrder.id}</p>
          </div>
          <div className="space-y-2 mb-4">
            {lastOrder.items.map((item: any, idx: number) => (
                <span key={idx} className="flex justify-between text-sm">
                <span>{item.quantity} x {item.itemName}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </span>
            ))}
          </div>
          <div className="border-t border-black pt-2 flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>₹{lastOrder.totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-center mt-6 text-sm">Thank you for dining with us!</p>
        </div>

        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in-fade">
          <div className="bg-green-500/20 text-green-500 p-8 rounded-full mb-8">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground text-lg mb-8">Order #{lastOrder.id} has been placed.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            <Button size="lg" variant="outline" className="h-24 text-lg flex flex-col gap-2" onClick={handlePrint}>
              <Printer className="w-8 h-8" />
              Standard Print
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-24 text-lg flex flex-col gap-2" 
              onClick={handleDownloadPDF}
            >
              <Download className="w-8 h-8" />
              Download PDF
            </Button>
            <Button size="lg" variant="outline" className="h-24 text-lg flex flex-col gap-2" onClick={handleWhatsApp}>
              <Send className="w-8 h-8" />
              Kitchen Order
            </Button>
            <Button size="lg" className="h-24 text-lg flex flex-col gap-2 bg-primary hover:bg-primary/90" onClick={() => setLastOrder(null)}>
              <Plus className="w-8 h-8" />
              New Order
            </Button>
          </div>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* LEFT: Menu Grid */}
        <div className="flex-1 flex flex-col border-r border-border bg-background/50">
          <div className="p-4 border-b border-border space-y-4 bg-card/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-lg bg-background border-input"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                    ${selectedCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT: Cart */}
        <div className="w-[380px] flex flex-col bg-card shadow-xl z-20">
          <div className="p-5 border-b border-border bg-card">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              Current Order
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                <ShoppingBag className="w-16 h-16" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div
                      key={item.menuItem.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-secondary/50 p-3 rounded-xl flex items-center gap-3 border border-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.menuItem.name}</h4>
                        <div className="text-sm text-primary font-mono">₹{item.menuItem.price}</div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-background rounded-lg p-1 border border-border">
                        <button 
                          onClick={() => updateQuantity(item.menuItem.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-mono font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.menuItem.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          <div className="p-5 border-t border-border bg-card/95 backdrop-blur">
            <div className="flex justify-between items-end mb-4">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-3xl font-bold font-mono text-primary">₹{cartTotal.toFixed(2)}</span>
            </div>
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
            >
              Checkout Now
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Confirm Payment</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "Cash", icon: Banknote },
                { id: "Card", icon: CreditCard },
                { id: "UPI", icon: Smartphone }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id as any)}
                  className={`
                    flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${paymentMode === m.id 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-transparent bg-secondary text-muted-foreground hover:bg-secondary/80"}
                  `}
                >
                  <m.icon className="w-8 h-8" />
                  <span className="font-medium">{m.id}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Notes (Optional)</label>
              <Input 
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="No onions, extra spicy, etc."
                className="bg-secondary border-transparent focus:border-primary"
              />
            </div>

            <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-xl">
              <span className="text-lg">Total to Pay</span>
              <span className="text-2xl font-bold font-mono text-primary">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)} className="h-12">Cancel</Button>
            <Button 
              onClick={handleCheckout} 
              disabled={isPending}
              className="h-12 flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
            >
              {isPending ? "Processing..." : "Confirm & Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </KioskLayout>
  );
}
