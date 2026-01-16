import { toast } from "sonner";

// Функция для показа успешного toast
export const showSuccessToast = (message: string, description?: string) => {
  return toast.success(message, {
    description: description || message,
    duration: 3000,
    closeButton: true,
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "#ffffff",
      border: "1px solid rgba(16, 185, 129, 0.3)",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow:
        "0 10px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.1)",
      backdropFilter: "blur(10px)",
    },
    className: "toast-success",
    icon: "✓",
  });
};

// Функция для показа ошибки toast
export const showErrorToast = (message: string, description?: string) => {
  return toast.error(message, {
    description: description || message,
    duration: 3000,
    closeButton: true,
    style: {
      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
      color: "#ffffff",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow:
        "0 10px 40px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.1)",
      backdropFilter: "blur(10px)",
    },
    className: "toast-error",
    icon: "✕",
  });
};

// Функция для показа информационного toast
export const showInfoToast = (message: string, description?: string) => {
  return toast.info(message, {
    description: description || message,
    duration: 3000,
    closeButton: true,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      color: "#ffffff",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow:
        "0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)",
      backdropFilter: "blur(10px)",
    },
    className: "toast-info",
    icon: "ℹ",
  });
};

// Функция для показа предупреждения toast
export const showWarningToast = (message: string, description?: string) => {
  return toast.warning(message, {
    description: description || message,
    duration: 3000,
    closeButton: true,
    style: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "#ffffff",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow:
        "0 10px 40px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.1)",
      backdropFilter: "blur(10px)",
    },
    className: "toast-warning",
    icon: "⚠",
  });
};

// Функция для показа loading toast (с возможностью обновления)
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    style: {
      background: "linear-gradient(135deg, #8B7FFF 0%, #6DD5ED 100%)",
      color: "#ffffff",
      border: "1px solid rgba(139, 127, 255, 0.3)",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow:
        "0 10px 40px rgba(139, 127, 255, 0.3), 0 0 0 1px rgba(139, 127, 255, 0.1)",
      backdropFilter: "blur(10px)",
    },
    className: "toast-loading",
  });
};

// Функция для обновления существующего toast
export const updateToast = (
  toastId: string | number,
  type: "success" | "error" | "info" | "warning",
  message: string,
  description?: string
) => {
  const styles = {
    success: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      border: "1px solid rgba(16, 185, 129, 0.3)",
      boxShadow:
        "0 10px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.1)",
    },
    error: {
      background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      boxShadow:
        "0 10px 40px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.1)",
    },
    info: {
      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      boxShadow:
        "0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)",
    },
    warning: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      boxShadow:
        "0 10px 40px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(245, 158, 11, 0.1)",
    },
  };

  toast[type](message, {
    id: toastId,
    description: description || message,
    duration: 3000,
    closeButton: true,
    style: {
      ...styles[type],
      color: "#ffffff",
      borderRadius: "12px",
      padding: "16px 20px",
      backdropFilter: "blur(10px)",
    },
  });
};