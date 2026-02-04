"use client";

import { motion } from "framer-motion";
import { Camera, Save, User, Phone, FileText, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSellerProfile } from "@/features/seller/hooks/useSellerProfile";
import { useUpdateSellerProfile } from "@/features/seller/hooks/useUpdateSellerProfile";
import { showErrorToast } from "@/lib/toasts";

const SettingsPage = () => {
  const { data: profile, isLoading } = useSellerProfile();
  
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateSellerProfile();
  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "",
    phone: "",
    description: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.sellers?.phone || "",
        description: profile.sellers?.description || "",
        password: "",
        confirmPassword: "",
      });
      setAvatarPreview(profile.sellers?.avatarUrl || null);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Ошибка", "Пожалуйста, выберите изображение");
      return;
    }

    // Создаем превью
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация пароля
    if (formData.password && formData.password !== formData.confirmPassword) {
      showErrorToast("Ошибка", "Пароли не совпадают");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showErrorToast("Ошибка", "Пароль должен быть не менее 6 символов");
      return;
    }

    // Подготавливаем данные для отправки
    const updateData: any = {};
    if (formData.firstName) updateData.firstName = formData.firstName;
    if (formData.lastName) updateData.lastName = formData.lastName;
    if (formData.phone !== undefined) updateData.phone = formData.phone;
    if (formData.description !== undefined)
      updateData.description = formData.description;
    if (formData.password) updateData.password = formData.password;
    // Отправляем файл напрямую на бэкенд
    if (avatarFile) updateData.avatar = avatarFile;

    setIsUploadingAvatar(true);
    updateProfile(updateData, {
      onSuccess: () => {
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setAvatarFile(null);
        setIsUploadingAvatar(false);
      },
      onError: () => {
        setIsUploadingAvatar(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#A0AEC0]">Загрузка...</div>
      </div>
    );
  }

  const seller = profile?.sellers;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl text-white mb-2">Настройки профиля</h1>
        <p className="text-[#A0AEC0]">
          Управляйте своими личными данными и настройками магазина
        </p>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-8 rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 space-y-8"
        >
          {/* Аватар */}
          <div>
            <label className="block mb-3 text-white">Аватар</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#A0AEC0]" />
                  )}
                </div>
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-0 right-0 p-2 bg-[#8B7FFF] rounded-full cursor-pointer shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </motion.label>
              </div>
              <div>
                <p className="text-sm text-white mb-1">Загрузите фото профиля</p>
                <p className="text-xs text-[#A0AEC0]">
                  Рекомендуемый размер: 200x200px. Максимальный размер: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Личная информация */}
          <div className="space-y-6">
            <h3 className="text-lg text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Личная информация
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#A0AEC0] mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                  placeholder="Введите имя"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A0AEC0] mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-[#A0AEC0] mb-2">
                <Phone className="w-4 h-4" />
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                placeholder="+7 (999) 999-99-99"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-[#A0AEC0] mb-2">
                <FileText className="w-4 h-4" />
                Описание магазина
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all resize-none"
                placeholder="Расскажите о своем магазине..."
              />
              <p className="text-xs text-[#A0AEC0] mt-2">
                {formData.description.length} / 500 символов
              </p>
            </div>
          </div>

          {/* Безопасность */}
          <div className="space-y-6">
            <h3 className="text-lg text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Безопасность
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#A0AEC0] mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                  placeholder="Оставьте пустым, чтобы не менять"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A0AEC0] mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                  placeholder="Повторите пароль"
                />
              </div>
            </div>
          </div>

          {/* Только для чтения поля */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="text-lg text-white">Информация о магазине</h3>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Название магазина
              </label>
              <input
                type="text"
                value={seller?.storeName || ""}
                disabled
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 cursor-not-allowed opacity-50"
              />
              <p className="text-xs text-[#A0AEC0] mt-1">
                Название магазина нельзя изменить
              </p>
            </div>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 cursor-not-allowed opacity-50"
              />
              <p className="text-xs text-[#A0AEC0] mt-1">
                Email нельзя изменить
              </p>
            </div>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Категория магазина
              </label>
              <input
                type="text"
                value={seller?.category || ""}
                disabled
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white/50 cursor-not-allowed opacity-50"
              />
              <p className="text-xs text-[#A0AEC0] mt-1">
                Категорию магазина нельзя изменить
              </p>
            </div>
          </div>

          {/* Кнопка сохранения */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isUpdating || isUploadingAvatar}
            className="w-full h-12 px-6 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isUpdating || isUploadingAvatar
              ? "Сохранение..."
              : "Сохранить изменения"}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default SettingsPage;

