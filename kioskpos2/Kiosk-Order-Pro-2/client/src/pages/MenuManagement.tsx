import { useState } from "react";
import { KioskLayout } from "@/components/KioskLayout";
import { useMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/use-kiosk";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MenuManagement() {
  const { data: menuItems = [] } = useMenu();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ name: "", price: "", category: "General" });

  const resetForm = () => {
    setFormData({ name: "", price: "", category: "General" });
    setEditingItem(null);
  };

  const handleOpen = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        price: item.price.toString(), 
        category: item.category || "General" 
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    if (!formData.name || isNaN(price)) {
      toast({ title: "Invalid input", variant: "destructive" });
      return;
    }

    const payload = { 
      name: formData.name, 
      price, 
      category: formData.category,
      available: true 
    };

    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, ...payload }, {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Item updated" });
        }
      });
    } else {
      createItem.mutate(payload, {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Item created" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate(id, {
        onSuccess: () => toast({ title: "Item deleted" })
      });
    }
  };

  const filteredItems = menuItems.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <KioskLayout>
      <div className="container mx-auto p-8 max-w-6xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit or remove items from your menu.</p>
          </div>
          <Button onClick={() => handleOpen()} size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5" /> Add New Item
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border flex flex-col flex-1 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border bg-secondary/10">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-secondary/30 sticky top-0 backdrop-blur-sm z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-mono text-muted-foreground">#{item.id}</TableCell>
                    <TableCell className="font-medium text-lg">{item.name}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-white/10">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-primary font-bold">
                      ₹{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpen(item)}>
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Item Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Cheese Burger"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label>Price (₹)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <label>Category</label>
                <Input 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g. Burgers"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createItem.isPending || updateItem.isPending}>
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </KioskLayout>
  );
}
