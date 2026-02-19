"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Camera, 
  Save, 
  Plus, 
  Trash2,
  Lock
} from "lucide-react";
import { showErrorToast } from "@/lib/toasts";
import { InputField } from "@/features/client/ui/InputField";
import { useClientProfile, useUpdateClientProfile } from "@/features/client";

interface Address {
  id: string;
  value: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  avatar_url: string;
  gender: "male" | "female" | "other";
  birth_date: string;
  addresses: Address[];
  password?: string;
  confirmPassword?: string;
}

const ClientProfilePage = () => {
  const { data: profileData } = useClientProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateClientProfile();
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    avatar_url: "",
    gender: "male",
    birth_date: "",
    addresses: [],
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profileData) {
      setProfile({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        username: profileData.customers[0]?.username || "",
        email: profileData.email || "",
        phone: profileData.customers[0]?.phone || profileData.phone || "",
        avatar_url: profileData.customers[0]?.avatar_url || "",
        gender: profileData.customers[0]?.gender || "male",
        birth_date: profileData.customers[0]?.birth_date || "",
        addresses: profileData.customers[0]?.addresses || [],
        password: "",
        confirmPassword: "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [profileData]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Ошибка", "Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Ошибка", "Размер файла не должен превышать 5MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAddressChange = (id: string, newValue: string) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => 
        addr.id === id ? { ...addr, value: newValue } : addr
      )
    }));
  };

  const addAddress = () => {
    setProfile(prev => ({
      ...prev,
      addresses: [...prev.addresses, { id: Date.now().toString(), value: "" }]
    }));
  };

  const removeAddress = (id: string) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (profile.password && profile.password !== profile.confirmPassword) {
      showErrorToast("Ошибка", "Пароли не совпадают");
      return;
    }
    
    if (profile.password && profile.password.length < 6) {
        showErrorToast("Ошибка", "Пароль должен быть не менее 6 символов");
        return;
    }

    const updateData: any = {};
    if (profile.firstName) updateData.first_name = profile.firstName;
    if (profile.lastName) updateData.last_name = profile.lastName;
    if (profile.username) updateData.username = profile.username;
    if (profile.phone) updateData.phone = profile.phone;
    if (profile.gender) updateData.gender = profile.gender;
    if (profile.birth_date) updateData.birth_date = profile.birth_date;
    if (profile.password) updateData.password = profile.password;
    if (profile.addresses) updateData.addresses = profile.addresses;

    if (avatarFile) {
        updateData.avatar = avatarFile;
    }

    updateProfile(updateData, {
      onSuccess: () => {
        setProfile((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setAvatarFile(null);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Мой профиль</h1>
        <p className="text-[#A0AEC0]">Управляйте личными данными и адресами доставки</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* === ЛЕВАЯ КОЛОНКА (Аватар + Адреса) === */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="lg:col-span-1 space-y-6"
        >
          {/* 1. Карточка Аватара */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 text-center shadow-xl">
            <div className="relative w-40 h-40 mx-auto mb-6 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#1A1F2E] ring-2 ring-white/10 shadow-lg">
                <img 
                    src={avatarPreview || profile.avatar_url || "/placeholder-avatar.jpg"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                />
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-300">
                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{profile.username || "Пользователь"}</h2>
            <p className="text-[#A0AEC0] text-sm mb-6 wrap-break-word">{profile.email}</p>
          </div>

          {/* 2. Адреса доставки (В ЛЕВОЙ КОЛОНКЕ) */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8B7FFF]" />
                Адреса
              </h3>
              <button type="button" onClick={addAddress} className="text-xs text-[#8B7FFF] hover:text-[#6DD5ED] flex items-center gap-1 transition-colors font-medium border border-[#8B7FFF]/30 px-2 py-1 rounded-md hover:bg-[#8B7FFF]/10">
                <Plus className="w-3 h-3" /> Добавить
              </button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {profile.addresses.length > 0 ? (
                    profile.addresses.map((addr) => (
                    <motion.div 
                        key={addr.id} 
                        initial={{ opacity: 0, height: 0, y: -10 }} 
                        animate={{ opacity: 1, height: "auto", y: 0 }} 
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }} 
                        className="group"
                    >
                        <div className="relative flex gap-2">
                            <input 
                                value={addr.value} 
                                onChange={(e) => handleAddressChange(addr.id, e.target.value)} 
                                placeholder="Город, улица..." 
                                className="w-full h-10 pl-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 transition-all" 
                            />
                             <button 
                                type="button" 
                                onClick={() => removeAddress(addr.id)} 
                                className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center text-[#A0AEC0] hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                    ))
                ) : (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <p className="text-[#A0AEC0] text-xs">Нет сохраненных адресов</p>
                    </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* === ПРАВАЯ КОЛОНКА (Инфо + Пароль + Кнопка) === */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          
          {/* Личная информация */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8B7FFF]" />
              Личная информация
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={User} label="Имя" value={profile.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="Ваше имя" />
              <InputField icon={User} label="Фамилия" value={profile.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Ваша фамилия" />
              <InputField icon={User} label="Никнейм" value={profile.username} onChange={(e) => handleInputChange("username", e.target.value)} placeholder="Никнейм" />
              <InputField icon={Phone} label="Телефон" value={profile.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="+7 (___) ___-__-__" type="tel" />

              <div className="space-y-2">
                <label className="text-sm text-[#A0AEC0]">Пол</label>
                <div className="relative">
                  <select value={profile.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="w-full h-12 pl-4 pr-10 bg-white/5 border border-white/10 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 transition-all cursor-pointer">
                    <option className="bg-[#1A1F2E]" value="male">Мужской</option>
                    <option className="bg-[#1A1F2E]" value="female">Женский</option>
                    <option className="bg-[#1A1F2E]" value="other">Не указан</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                     <svg className="w-4 h-4 text-[#A0AEC0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#A0AEC0]">Дата рождения</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <input type="date" value={profile.birth_date} onChange={(e) => handleInputChange("birth_date", e.target.value)} className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 transition-all scheme:dark" />
                </div>
              </div>
            </div>
          </div>

          {/* Безопасность */}
          <div className="bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#8B7FFF]" />
              Безопасность
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={Lock} label="Новый пароль" type="password" value={profile.password} onChange={(e) => handleInputChange("password", e.target.value)} placeholder="Оставьте пустым, чтобы не менять" />
              <InputField icon={Lock} label="Подтвердите пароль" type="password" value={profile.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} placeholder="Повторите пароль" />
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isUpdating} className="w-full py-4 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-xl text-white font-bold text-lg shadow-lg shadow-[#8B7FFF]/20 hover:shadow-[#8B7FFF]/40 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
            {isUpdating ? "Сохранение..." : <><Save className="w-5 h-5" /> Сохранить изменения</>}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default ClientProfilePage;