import { supabaseAdmin, hasAdminClient } from "../../lib/supabase";

/**
 * Admin Operations - Supabase Admin API kullanarak kullanıcı yönetimi
 * Bu işlemler service role key gerektirir
 */

/**
 * Kullanıcı hesabını tamamen siler (Auth + Database)
 * @param userId - Silinecek kullanıcının ID'si
 * @returns Başarılı ise true, değilse false
 */
export async function deleteUserAccount(userId: string): Promise<{ success: boolean; message: string }> {
    if (!hasAdminClient || !supabaseAdmin) {
        throw new Error('Admin client not available. Cannot perform admin operations.');
    }

    try {
        // 1. Önce Supabase Auth'tan sil
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Kullanıcı Auth silme hatası:", authError);
            throw new Error(`Auth silme hatası: ${authError.message}`);
        }

        // 2. Profiles tablosundan sil (CASCADE ile otomatik silinmeli ama yine de kontrol)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.warn("Profil silme hatası (göz ardı edilebilir):", profileError);
        }

        // 3. Users tablosundan sil
        const { error: userError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) {
            console.warn("Users tablosu silme hatası (göz ardı edilebilir):", userError);
        }

        return { success: true, message: "Kullanıcı başarıyla silindi" };

    } catch (error) {
        console.error("Kullanıcı silme işlemi başarısız:", error);
        throw error;
    }
}

/**
 * Tüm kullanıcıları admin olarak listeler
 * @returns Kullanıcı listesi
 */
export async function getAllUsersAsAdmin() {
    if (!hasAdminClient || !supabaseAdmin) {
        throw new Error('Admin client not available. Cannot perform admin operations.');
    }

    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error("Kullanıcı listeleme hatası:", error);
            throw error;
        }

        return data.users || [];
    } catch (error) {
        console.error("getAllUsersAsAdmin hatası:", error);
        throw error;
    }
}

/**
 * Kullanıcı ban durumunu günceller
 * @param userId - Kullanıcı ID'si
 * @param banned - Ban durumu
 */
export async function updateUserBanStatus(userId: string, banned: boolean): Promise<boolean> {
    if (!hasAdminClient || !supabaseAdmin) {
        throw new Error('Admin client not available.');
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: banned ? '876000h' : 'none'
        });

        if (error) {
            console.error("Ban durumu güncelleme hatası:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("updateUserBanStatus hatası:", error);
        return false;
    }
}

/**
 * Kullanıcı rolünü günceller
 * @param userId - Kullanıcı ID'si
 * @param role - Yeni rol ('user' | 'admin')
 */
export async function updateUserRoleAsAdmin(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    if (!hasAdminClient || !supabaseAdmin) {
        throw new Error('Admin client not available.');
    }

    try {
        // Users tablosundaki rolü güncelle
        const { error } = await supabaseAdmin
            .from('users')
            .update({ role })
            .eq('id', userId);

        if (error) {
            console.error("Rol güncelleme hatası:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("updateUserRoleAsAdmin hatası:", error);
        return false;
    }
}
