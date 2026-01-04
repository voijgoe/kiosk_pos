import { MenuItem } from "@shared/schema";
import { Plus } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group relative flex flex-col justify-between p-4 h-32 rounded-2xl bg-secondary/30 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98] text-left overflow-hidden"
    >
      <div className="z-10 w-full">
        <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground">{item.category}</p>
      </div>

      <div className="flex items-end justify-between w-full mt-auto z-10">
        <span className="font-mono text-lg font-semibold text-primary">
          ₹{item.price.toFixed(2)}
        </span>
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
        </div>
      </div>

      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
