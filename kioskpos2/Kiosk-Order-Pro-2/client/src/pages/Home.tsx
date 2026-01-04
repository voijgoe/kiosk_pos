import { Link } from "wouter";
import { KioskLayout } from "@/components/KioskLayout";
import { ShoppingBag, FileText, Settings, Coffee, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  {
    title: "New Order",
    icon: <UtensilsCrossed className="w-10 h-10" />,
    href: "/pos",
    color: "bg-primary",
    textColor: "text-primary-foreground",
    description: "Start a new customer order"
  },
  {
    title: "Menu Items",
    icon: <Coffee className="w-10 h-10" />,
    href: "/menu",
    color: "bg-secondary",
    textColor: "text-foreground",
    description: "Manage products & prices"
  },
  {
    title: "Reports",
    icon: <FileText className="w-10 h-10" />,
    href: "/reports",
    color: "bg-secondary",
    textColor: "text-foreground",
    description: "View sales history"
  },
  {
    title: "Settings",
    icon: <Settings className="w-10 h-10" />,
    href: "/settings",
    color: "bg-secondary",
    textColor: "text-foreground",
    description: "Configure shop details"
  }
];

export default function Home() {
  return (
    <KioskLayout>
      <div className="h-full flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
          {menuItems.map((item, index) => (
            <Link key={item.title} href={item.href} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  h-48 sm:h-64 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden
                  ${item.color} ${item.textColor}
                  shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
                  border border-white/5
                `}
              >
                <div className="relative z-10">
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-6
                    ${item.title === 'New Order' ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                  `}>
                    {item.icon}
                  </div>
                  <h2 className="text-3xl font-bold font-display tracking-tight mb-2">
                    {item.title}
                  </h2>
                  <p className={`text-sm opacity-80 ${item.title === 'New Order' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {item.description}
                  </p>
                </div>

                {/* Decorative background circle */}
                <div className={`
                  absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20
                  ${item.title === 'New Order' ? 'bg-white' : 'bg-primary'}
                `} />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </KioskLayout>
  );
}
