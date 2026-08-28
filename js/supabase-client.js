/* ============================================================
   بصائرنا — Supabase Client

   هذا الملف يتعامل مع قاعدة بيانات Supabase السحابية
   ============================================================ */

(function () {
  // ضع هنا بيانات Supabase الخاصة بك
  const SUPABASE_URL = 'https://rfzvvhgpqcwftszagdkn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmenZ2aGdwcWN3ZnRzemFnZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MDEzNzcsImV4cCI6MjEwMzQ3NzM3N30.kgwzC4EGkd9_0QyCUiYYxG5uT1XQNlxQVhVqU_ZPHrg';

  // التحقق من وجود الإعدادات
  const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY &&
                       !SUPABASE_URL.includes('YOUR_') &&
                       !SUPABASE_ANON_KEY.includes('YOUR_');

  // عنوان API
  const API_URL = isConfigured ? `${SUPABASE_URL}/rest/v1` : null;

  // Headers للطلبات
  function headers() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  // ═══════════════════════════════════════════════════════════
  // وظائف التقارير (Reports)
  // ═══════════════════════════════════════════════════════════

  async function saveReport(report) {
    if (!isConfigured) {
      console.warn('[Supabase] غير مُعدّ - التقرير محفوظ محلياً فقط');
      return null;
    }

    try {
      // استخدام upsert (insert or update) - أبسط وأضمن
      const saveResponse = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          ...headers(),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(report)
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('[Supabase] Response error:', errorText);
        throw new Error(`خطأ في الحفظ: ${saveResponse.status} - ${errorText}`);
      }

      const saved = await saveResponse.json();
      console.log('[Supabase] ✅ تم حفظ التقرير بنجاح:', report.id);
      return saved[0] || saved;
    } catch (error) {
      console.error('[Supabase] ❌ فشل حفظ التقرير:', error);
      console.error('[Supabase] تفاصيل الخطأ:', error.message);
      throw error;
    }
  }

  async function getReportsByUser(userId) {
    if (!isConfigured) return [];

    try {
      const response = await fetch(
        `${API_URL}/reports?userId=eq.${userId}&order=date.desc`,
        { headers: headers() }
      );

      if (!response.ok) throw new Error('فشل جلب التقارير');
      return await response.json();
    } catch (error) {
      console.error('[Supabase] خطأ في جلب التقارير:', error);
      return [];
    }
  }

  async function getReportsByDate(date) {
    if (!isConfigured) return [];

    try {
      const response = await fetch(
        `${API_URL}/reports?date=eq.${date}&submitted=eq.true`,
        { headers: headers() }
      );

      if (!response.ok) throw new Error('فشل جلب التقارير');
      return await response.json();
    } catch (error) {
      console.error('[Supabase] خطأ في جلب التقارير:', error);
      return [];
    }
  }

  async function getAllSubmittedReports() {
    if (!isConfigured) return [];

    try {
      const response = await fetch(
        `${API_URL}/reports?submitted=eq.true&order=submittedAt.desc`,
        { headers: headers() }
      );

      if (!response.ok) throw new Error('فشل جلب التقارير');
      return await response.json();
    } catch (error) {
      console.error('[Supabase] خطأ في جلب التقارير:', error);
      return [];
    }
  }

  // تصدير الوظائف
  window.SupabaseClient = {
    isConfigured,
    saveReport,
    getReportsByUser,
    getReportsByDate,
    getAllSubmittedReports
  };

  console.log('[Supabase]', isConfigured ? 'جاهز ✓' : 'غير مُعدّ - محلي فقط');
})();
