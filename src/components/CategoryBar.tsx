import { categories } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Code, Brain, BookOpen, Landmark, GraduationCap, Dumbbell } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code, Brain, BookOpen, Landmark, GraduationCap, Dumbbell,
};

export default function CategoryBar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${active === 'all' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground glass'}`}
      >
        {active === 'all' && (
          <motion.div
            layoutId="cat-active"
            className="absolute inset-0 bg-primary rounded-xl glow-border"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">All</span>
      </button>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon];
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${active === cat.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground glass'}`}
          >
            {active === cat.id && (
              <motion.div
                layoutId="cat-active"
                className="absolute inset-0 bg-primary rounded-xl glow-border"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4" />}
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
