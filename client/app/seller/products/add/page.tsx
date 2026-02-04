"use client";

import { ArrowLeft, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCategories, useAddProduct } from "@/features/seller";
import ConfirmationPopUp from "@/components/ConfirmationPopUp";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { showErrorToast } from "@/lib/toasts";


const ProductAdd = () => {
  const router = useRouter();
  const { mutate: addProduct, isPending: isAddingProduct } = useAddProduct();
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    quantity: 0,
    price: 0,
    discountedPrice: 0,
    description: "",
    visibility: true,
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const isSubmittingRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.filter((file) => {
      // Проверяем, что это изображение
      return file.type.startsWith("image/");
    });

    // Создаем превью для новых файлов
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setUploadedImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Освобождаем URL превью
    URL.revokeObjectURL(imagePreviews[index]);

    // Удаляем из state
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteAllUploadedImages = () => {
    // Освобождаем все URL превью
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

    setUploadedImages([]);
    setImagePreviews([]);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductForm((prev) => ({
      ...prev,
      category: e.target.value,
      subcategory: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedImages.length === 0) {
      showErrorToast('Ошибка при добавлении продукта', 'Пожалуйста, загрузите хотя бы одно изображение')
      return;
    }

    isSubmittingRef.current = true;

    addProduct({
      title: productForm.name,
      description: productForm.description,
      category: productForm.category,
      subcategory: productForm.subcategory,
      quantity: productForm.quantity,
      price: productForm.price,
      discountedPrice: productForm.discountedPrice,
      images: uploadedImages,
      visibility: productForm.visibility,
    });

    router.push("/seller/products");
  };

  const handleCancel = () => {
    if (uploadedImages.length > 0) {
      setConfirmOpen(true);
      return;
    }
    router.back();
  };

  const handleConfirmCancel = () => {
    try {
      setConfirmLoading(true);
      deleteAllUploadedImages();
      router.back();
    } catch (error) {
      setConfirmLoading(false);
      console.log("Ошибка при удалении фото", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const discount = useMemo(
    () => calculateDiscount(productForm.price, productForm.discountedPrice),
    [productForm.price, productForm.discountedPrice],
  );

  useEffect(() => {
    return () => {
      // Освобождаем все URL превью при размонтировании компонента
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:scale-105 transition-all duration-200"
        >
          <ArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl text-white">Добавить новый продукт</h1>
          <p className="text-[#A0AEC0]">Создайте новый список товаров</p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-[#1A1F2E]/80 backdrop-blur-xl border border-white/5 space-y-8">
        <div>
          <label className="block mb-3 text-white">Изображения продукта</label>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/10 rounded-lg hover:border-[#8B7FFF]/50 transition-colors cursor-pointer group">
              <Upload className="text-[#A0AEC0] group-hover:text-[#8B7FFF] transition-colors" />
              <p className="text-sm text-[#A0AEC0] mb-1 mt-2">
                Перетащите изображения сюда
              </p>
              <p className="text-xs text-[#A0AEC0]">или нажмите для выбора</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg text-white">Основная информация</h3>

          <div>
            <label className="block text-sm text-[#A0AEC0] mb-2">
              Название продукта
            </label>
            <input
              type="text"
              placeholder="Введите название продукта"
              value={productForm.name}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-lg text-lg text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Категория
              </label>
              <select
                value={productForm.category}
                onChange={handleCategoryChange}
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
              >
                <option className="bg-[#1A1F2E]" value="">
                  Выберите категорию
                </option>
                {Object.entries(ProductCategories).map(([key, value]) => (
                  <option className="bg-[#1A1F2E]" key={key} value={key}>
                    {value.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Подкатегория
              </label>
              <select
                value={productForm.subcategory}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    subcategory: e.target.value,
                  }))
                }
                disabled={!productForm.category}
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option className="bg-[#1A1F2E]" value="">
                  Выберите подкатегорию
                </option>
                {productForm.category &&
                  Object.entries(
                    ProductCategories[
                      productForm.category as keyof typeof ProductCategories
                    ].children,
                  ).map(([key, value]) => (
                    <option className="bg-[#1A1F2E]" key={key} value={key}>
                      {value}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A0AEC0] mb-2">
              Количество на складе
            </label>
            <input
              type="number"
              placeholder="0"
              value={productForm.quantity}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white tabular-nums placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Цена (тенге)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                  ₸
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.price || ""}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-11 pl-8 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white tabular-nums placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A0AEC0] mb-2">
                Цена со скидкой (тенге)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                  ₸
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.discountedPrice || ""}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      discountedPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full h-11 pl-8 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white tabular-nums placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all"
                />
                {discount > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#A0AEC0] mb-2">Описание</label>
          <textarea
            rows={6}
            placeholder="Опишите ваш продукт... (Поддерживается Markdown)"
            value={productForm.description}
            onChange={(e) =>
              setProductForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all resize-none"
          />
          <p className="text-xs text-[#A0AEC0] mt-2">
            {productForm.description.length} / 1000 символов
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg mb-1 text-white">Видимость</h3>
            <p className="text-sm text-[#A0AEC0]">
              Управление видимостью продукта на маркетплейсе
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={productForm.visibility}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  visibility: e.target.checked,
                }))
              }
            />
            <div className="w-14 h-7 bg-white/10 rounded-full peer-checked:bg-linear-to-r peer-checked:from-[#8B7FFF] peer-checked:to-[#6DD5ED] transition-all">
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform translate-y-1 ${
                  productForm.visibility ? "translate-x-8" : "translate-x-1"
                }`}
              ></div>
            </div>
            <span className="ml-3 text-sm text-white">
              {productForm.visibility ? "Опубликован" : "Скрыт"}
            </span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-12 px-6 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <ConfirmationPopUp
            open={confirmOpen}
            title="Отменить создание товара?"
            message={`У вас ${uploadedImages.length} загруженных изображений. Они будут удалены. Продолжить?`}
            confirmText="Да, удалить изображения"
            cancelText="Отмена"
            isLoading={confirmLoading}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmCancel}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-12 px-6 bg-linear-to-r from-[#8B7FFF] to-[#6DD5ED] rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-[#8B7FFF]/50 transition-all"
          >
            {isAddingProduct ? "Добавление..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
