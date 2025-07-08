import React, { useState, useRef } from 'react';
import { AvatarSettings } from '@/types/message';
import { IoClose, IoImage } from 'react-icons/io5';

interface AvatarEditorProps {
  currentSettings?: AvatarSettings;
  userName: string;
  onSave: (settings: AvatarSettings | null) => void;
  onClose: () => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentSettings,
  userName,
  onSave,
  onClose
}) => {
  const [settings, setSettings] = useState<AvatarSettings>(
    currentSettings || {
      url: '',
      scale: 1.0,
      positionX: 50,
      positionY: 50
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setSettings(prev => ({ ...prev, url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (settings.url) {
      onSave(settings);
    } else {
      onSave(null);
    }
    onClose();
  };

  const handleRemove = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{userName}のアイコン編集</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* プレビュー */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プレビュー
          </label>
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300 mx-auto">
            {settings.url ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${settings.url})`,
                  backgroundSize: `${settings.scale * 100}%`,
                  backgroundPosition: `${settings.positionX}% ${settings.positionY}%`
                }}
              />
            ) : (
              <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                {userName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* 画像選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            画像を選択
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <IoImage size={20} />
              <span>画像を選択</span>
            </button>
            {settings.url && (
              <button
                onClick={handleRemove}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                削除
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {settings.url && (
          <>
            {/* 拡大率 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拡大率: {Math.round(settings.scale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={settings.scale}
                onChange={(e) => setSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* 横位置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                横位置: {settings.positionX}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.positionX}
                onChange={(e) => setSettings(prev => ({ ...prev, positionX: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* 縦位置 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                縦位置: {settings.positionY}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.positionY}
                onChange={(e) => setSettings(prev => ({ ...prev, positionY: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* ボタン */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B04B]"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};