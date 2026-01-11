'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCurrentUser, useUpdateCurrentUser, useDeleteCurrentUser } from '../../../hooks/useApi';
import resolveImageUrl from '../../../lib/resolveImageUrl';
export default function ProfileInfo() {
  const { data: session } = useSession();
  const { data: backendUser, isLoading } = useCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const deleteUser = useDeleteCurrentUser();

  const user = backendUser || session?.user;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const populateFromUser = () => {
    const fallbackAvatar =
      resolveImageUrl((user as any)?.avatarUrl || (user as any)?.image || null);
    setAvatarObjectUrl(null);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setAvatarPreview(fallbackAvatar);
    setAvatarDirty(false);
    setAvatarError(null);
    setSaveError(null);

    setFirstName((user as any)?.firstname || (user as any)?.firstName || '');
    setLastName((user as any)?.lastname || (user as any)?.lastName || '');
    setPhone((user as any)?.phone || '');
    setAccountType((user as any)?.accountType || '');
  };

  useEffect(() => {
    populateFromUser();
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl);
      }
    };
  }, [avatarObjectUrl]);

  const initials = useMemo(() => {
    const first = (user as any)?.firstname || (user as any)?.firstName || '';
    const last = (user as any)?.lastname || (user as any)?.lastName || '';
    if (!first && !last) return '';
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }, [user]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Та зурагаа сонгоно уу');
      return;
    }
    setAvatarError(null);
    const objectUrl = URL.createObjectURL(file);
    setAvatarObjectUrl(objectUrl);
    setAvatarPreview(objectUrl);
    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarDirty(true);
  };

  const handleRemoveAvatar = () => {
    setAvatarObjectUrl(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setAvatarDirty(true);
    setAvatarError(null);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('Нэр болон овог заавал оруулна уу');
      return;
    }
    setSaveError(null);
    setSaveSuccess(null);
    const formData = new FormData();
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    formData.append('phone', phone.trim());
    if (accountType) formData.append('accountType', accountType);
    if (avatarDirty && avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (removeAvatar) {
      formData.append('removeAvatar', 'true');
    }
    try {
      await updateUser.mutateAsync(formData);
      setAvatarDirty(false);
      setRemoveAvatar(false);
      setSaveSuccess('Профайл шинэчлэгдлээ');
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.message || 'Мэдээлэл шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Бүртгэлээ бүрмөсөн устгах уу?');
    if (!confirmed) return;
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await deleteUser.mutateAsync();
      if (session?.user) {
        await signOut({ redirect: false });
      }
      window.location.href = '/';
    } catch (err: any) {
      setSaveError(err?.message || 'Бүртгэл устгах үед алдаа гарлаа');
    }
  };

  const handleCancel = () => {
    populateFromUser();
    setIsEditing(false);
    setSaveSuccess(null);
  };

  if (isLoading) return <p>Түр хүлээнэ үү...</p>;
  if (!user) return <p>Хэрэглэгчийн мэдээлэл олдсонгүй</p>;

  return (
    <div className="space-y-6">
      {!isEditing && (
        <>
          {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-semibold text-gray-600">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (initials || '🙂'
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <div><strong>Нэр:</strong> {firstName}</div>
                <div><strong>Овог:</strong> {lastName}</div>
                <div><strong>Утас:</strong> {phone || '—'}</div>
                <div><strong>Хэрэглэгчийн төрөл:</strong> {accountType || '—'}</div>
              </div>
            </div>
            <button
              onClick={() => { setIsEditing(true); setSaveSuccess(null); }}
              className="self-start rounded border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              Засварлах
            </button>
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            <div><strong>Имэйл:</strong> {user.email}</div>

          </div>
        </>
      )}

      {isEditing && (
        <>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-semibold text-gray-600">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (initials || '🙂'
                )}
              </div>
              <div className="space-y-2">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded border px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Зураг солих
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-sm text-red-600 underline"
                  >
                    Зурагыг устгах
                  </button>
                )}
                {avatarError && <p className="text-sm text-red-500">{avatarError}</p>}
                {avatarDirty && <p className="text-sm text-blue-600">Шинэ зураг сонгогдсон, хадгалахыг дарна уу</p>}
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Нэр</label>
                <input
                  className="rounded border px-3 py-2"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Овог</label>
                <input
                  className="rounded border px-3 py-2"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Утас</label>
                <input
                  className="rounded border px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Хэрэглэгчийн төрөл</label>
                <select
                  className="rounded border px-3 py-2"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="">Сонгох</option>
                  <option value="Хувь хүн">Хувь хүн</option>
                  <option value="Хувиараа хөдөлмөр эрхлэгч">Хувиараа хөдөлмөр эрхлэгч</option>
                  <option value="Байгууллага">Байгууллага</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-700">
            <div><strong>Имэйл:</strong> {user.email}</div>
          </div>

          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleDeleteAccount}
              className="mr-auto rounded border border-red-500 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              type="button"
              disabled={deleteUser.isPending}
            >
              Бүртгэл устгах
            </button>
            <button
              onClick={handleCancel}
              className="rounded border px-4 py-2 text-sm transition hover:bg-gray-100"
              type="button"
            >
              Болих
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={updateUser.isPending}
              className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
              type="button"
            >
              {updateUser.isPending ? 'Хадгалж байна...' : 'Өөрчлөлт хадгалах'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
