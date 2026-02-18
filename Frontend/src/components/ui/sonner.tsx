import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 dark:group-[.toaster]:bg-slate-900/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-white/20 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-bold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-medium",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl font-black",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl",
          success: "group-[.toaster]:border-green-500/50 group-[.toaster]:text-green-600 dark:group-[.toaster]:text-green-400",
          error: "group-[.toaster]:border-red-500/50 group-[.toaster]:text-red-600 dark:group-[.toaster]:text-red-400",
          info: "group-[.toaster]:border-blue-500/50 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400",
          warning: "group-[.toaster]:border-amber-500/50 group-[.toaster]:text-amber-600 dark:group-[.toaster]:text-amber-400",
        },
      }}
      position="top-right"
      expand={true}
      richColors
      {...props}
    />
  );
};

export { Toaster, toast };
