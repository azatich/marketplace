import { Toaster } from "@/components/ui/sonner";

const ToasterSonner = () => {
  return (
    <Toaster 
      position="top-center" 
      closeButton={true}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
        className: "toast-custom",
      }}
    />
  );
};

export default ToasterSonner;
