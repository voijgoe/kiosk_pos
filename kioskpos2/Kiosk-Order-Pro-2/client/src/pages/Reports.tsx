import { KioskLayout } from "@/components/KioskLayout";
import { useOrders, useSettings } from "@/hooks/use-kiosk";
import { format, isSameDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Download, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { data: orders = [] } = useOrders();
  const { data: settings } = useSettings();
  const [date, setDate] = useState<Date>(new Date());

  // Analytics based on selected date
  const filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || "");
    return isSameDay(orderDate, date);
  });
  
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(settings?.shopName || "Kiosk POS System", 14, 22);
    doc.setFontSize(12);
    doc.text(`Sales Report - ${format(date, "MMMM d, yyyy")}`, 14, 30);
    
    // Summary
    doc.setFontSize(10);
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 40);
    doc.text(`Total Revenue: Rs. ${totalSales.toFixed(2)}`, 14, 45);

    // Table
    const tableData = filteredOrders.map(order => [
      `#${order.id}`,
      format(new Date(order.createdAt || ""), "h:mm a"),
      order.paymentMode,
      `Rs. ${order.totalAmount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Order ID", "Time", "Payment Mode", "Amount"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 112, 67] } // Primary color
    });

    doc.save(`sales-report-${format(date, "yyyy-MM-dd")}.pdf`);
  };

  return (
    <KioskLayout>
      <div className="container mx-auto p-8 max-w-6xl h-full flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Sales Reports</h1>
            <p className="text-muted-foreground">Viewing data for {format(date, "MMMM d, yyyy")}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal h-11",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={exportPDF} className="gap-2 h-11" disabled={filteredOrders.length === 0}>
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
          <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales (Selected Day)</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary font-mono">₹{totalSales.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/50 to-secondary/30 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                ₹{filteredOrders.length ? (totalSales / filteredOrders.length).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders List */}
        <div className="bg-card rounded-2xl border border-border flex flex-col flex-1 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border bg-secondary/10 font-medium">
            Transactions for {format(date, "MMM d, yyyy")}
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-secondary/30 sticky top-0 backdrop-blur-sm z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No transactions found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-mono text-muted-foreground">#{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt || ""), "h:mm a")}
                      </TableCell>
                      <TableCell>
                        <span className={`
                          px-2 py-1 rounded text-xs font-medium border
                          ${order.paymentMode === 'Cash' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            order.paymentMode === 'Card' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                            'bg-purple-500/10 text-purple-500 border-purple-500/20'}
                        `}>
                          {order.paymentMode}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{order.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
