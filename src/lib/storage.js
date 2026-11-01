import { supabase, getSupabaseConfig } from './supabase';

const INITIAL_STAGES = [
  { id: '1', title: 'รังวัดที่ดิน RTK GNSS (๒๖.๒๒ x ๑๔.๔๕ ม.)', status: 'done', photo: './images/cadastral_survey.jpg', notes: 'ช่างรังวัดปักหมุดครบแล้ว แปลงหน้ากว้าง 26.22 เมตร ได้พื้นที่ ~95 ตร.ว.' },
  { id: '2', title: 'ยื่นแบบขออนุญาตก่อสร้างเทศบาล & ไฟชั่วคราว', status: 'in_progress', photo: null, notes: 'เตรียมยื่นเอกสารแบบสถาปัตย์' },
  { id: '3', title: 'ปรับหน้าดิน & ถมระดับเสมอถนน +0.00 ม.', status: 'todo', photo: null, notes: '' },
  { id: '4', title: 'วางผังอาคาร & ตอกเสาเข็ม', status: 'todo', photo: null, notes: '' },
  { id: '5', title: 'เทคานคอดิน + หล่อเสา ค.ส.ล. ยกพื้น +0.50 ม.', status: 'todo', photo: null, notes: '' },
  { id: '6', title: 'โครงสร้างหลังคา & มุงกระเบื้องลอนเอลาบานา 25°', status: 'todo', photo: null, notes: '' },
  { id: '7', title: 'ก่ออิฐมอญแดง & วางท่อประปา/ร้อยท่อไฟ', status: 'todo', photo: null, notes: '' },
  { id: '8', title: 'ติดตั้งระบบประตูรั้ว 2 บาน (เลื่อน 5.2 ม. + สวิง 3.2 ม.)', status: 'todo', photo: null, notes: '' },
  { id: '9', title: 'ปูพื้นไวนิล SPC 4mm & กรุกระเบื้องห้องน้ำ', status: 'todo', photo: null, notes: '' },
  { id: '10', title: 'งานบิวท์อินเฟอร์นิเจอร์ & จัดสวน 10 เมตรฝั่งตะวันตก', status: 'todo', photo: null, notes: '' }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp_1',
    title: 'ค่าธรรมเนียมรังวัดที่ดินชั้น 1 RTK GNSS',
    amount: 15000,
    paidBy: 'JOB',
    date: '2026-10-09',
    category: 'งานรังวัด & เอกสาร',
    slipImage: null,
    createdAt: '2026-10-09T10:00:00Z'
  },
  {
    id: 'exp_2',
    title: 'มัดจำออกแบบและปรับแก้แบบสถาปัตย์',
    amount: 25000,
    paidBy: 'Pealpeal',
    date: '2026-10-18',
    category: 'งานออกแบบ',
    slipImage: null,
    createdAt: '2026-10-18T14:00:00Z'
  }
];

const INITIAL_NOTES = [
  {
    id: 'n1',
    pageId: 'notes',
    zoneId: 'general',
    title: 'สรุปการแบ่งแปลงที่ดินและทิศทางแดด-ลม',
    content: 'แปลงที่ดินหน้ากว้าง 26.22 ม. ลึก 14.45 ม. หันหน้าทิศเหนือ ติดถนน 8 เมตร พื้นที่สวน 10 เมตรอยู่ฝั่งทิศตะวันตกติดห้องนอนใหญ่ ต้องหาไม้พุ่มโปร่งช่วยบังแดดบ่าย',
    attachments: [
      { type: 'image', url: './images/cadastral_survey.jpg', label: 'โฉนดแผนที่รังวัด' }
    ],
    tag: 'ไอเดีย',
    date: '2026-10-31',
    isDone: false,
    createdBy: 'JOB',
    createdAt: '2026-10-31T10:00:00Z',
    updatedAt: '2026-10-31T10:00:00Z'
  },
  {
    id: 'n2',
    pageId: 'notes',
    zoneId: 'general',
    title: 'แบบบ้าน Contemporary สไตล์โครงการ',
    content: 'แบบบ้านสไตล์ร่วมสมัยตามโครงการ โทนสว่าง ซุ้มโค้งสวยงาม เข้ากับบริบทและสภาพแวดล้อมโครงการบ้านรัตนากร เฟส 10',
    attachments: [
      { type: 'image', url: './images/project_contemporary_house.png', label: 'แบบบ้านจริงของโครงการ' }
    ],
    tag: 'ไอเดีย',
    date: '2026-11-01',
    isDone: false,
    createdBy: 'Pealpeal',
    createdAt: '2026-11-01T08:30:00Z',
    updatedAt: '2026-11-01T08:30:00Z'
  },
  {
    id: 'n3',
    pageId: 'notes',
    zoneId: 'dual-gate',
    title: 'สเปกประตูรั้ว 2 บาน (ไม่ติดเสาโรงรถ)',
    content: 'ประตูเลื่อน 5.20 ม. สไลด์ไปทิศตะวันออก ส่วนประตูสวนเป็นบานสวิงคู่ 3.20 ม. (บานละ 1.60 ม.) สวิงเปิดเข้าสวน 90 องศาให้รถจอดบนบล็อกหญ้าได้สบาย',
    attachments: [
      { type: 'image', url: './images/perspective_dual_gate.jpg', label: 'ภาพจำลองระบบประตู 2 บาน' }
    ],
    tag: 'สเปก',
    date: '2026-10-31',
    isDone: true,
    createdBy: 'JOB',
    createdAt: '2026-10-31T16:00:00Z',
    updatedAt: '2026-10-31T16:00:00Z'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'noti_1',
    title: 'Pealpeal เพิ่มโน้ตใหม่',
    message: 'แบบบ้าน Contemporary สไตล์โครงการ',
    targetTab: 'notes',
    targetId: 'n2',
    user: 'Pealpeal',
    date: 'เมื่อเช้า 08:30',
    isRead: false
  },
  {
    id: 'noti_2',
    title: 'JOB เพิ่มโน้ตระบบประตู',
    message: 'สเปกประตูรั้ว 2 บาน (ไม่ติดเสาโรงรถ)',
    targetTab: 'notes',
    targetId: 'n3',
    user: 'JOB',
    date: 'เมื่อวาน 16:00',
    isRead: true
  }
];

export const StorageService = {
  // CUSTOM TAGS (Req 2)
  getCustomTags: () => {
    try {
      const saved = localStorage.getItem('home_custom_tags');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  addCustomTag: (newTag) => {
    if (!newTag || !newTag.trim()) return StorageService.getCustomTags();
    const tags = StorageService.getCustomTags();
    const cleanTag = newTag.trim();
    if (!tags.includes(cleanTag)) {
      const updated = [...tags, cleanTag];
      localStorage.setItem('home_custom_tags', JSON.stringify(updated));
      StorageService.triggerAutoSync();
      return updated;
    }
    return tags;
  },

  deleteCustomTag: (tagToDelete) => {
    const tags = StorageService.getCustomTags();
    const updated = tags.filter(t => t !== tagToDelete);
    localStorage.setItem('home_custom_tags', JSON.stringify(updated));
    StorageService.triggerAutoSync();
    return updated;
  },

  // NOTES
  getNotes: () => {
    try {
      const saved = localStorage.getItem('home_notes');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  },

  saveNotes: (notes) => {
    localStorage.setItem('home_notes', JSON.stringify(notes));
    StorageService.triggerAutoSync();
  },

  addNote: (note) => {
    const notes = StorageService.getNotes();
    const newNote = {
      ...note,
      id: 'n_' + Date.now(),
      date: note.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    StorageService.saveNotes(updated);
    
    // Notification for addition
    StorageService.addNotification({
      title: `${newNote.createdBy} เพิ่มโน้ตใหม่`,
      message: newNote.title || 'โน้ตใหม่',
      targetTab: 'notes',
      targetId: newNote.id,
      user: newNote.createdBy
    });

    return updated;
  },

  updateNote: (id, updates, currentUser) => {
    const notes = StorageService.getNotes();
    const target = notes.find(n => n.id === id);
    const updated = notes.map(n => n.id === id ? {
      ...n,
      ...updates,
      updatedAt: new Date().toISOString()
    } : n);
    StorageService.saveNotes(updated);

    // Notification for edit (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} แก้ไขโน้ต`,
        message: target ? target.title : 'โน้ต',
        targetTab: 'notes',
        targetId: id,
        user: currentUser
      });
    }

    return updated;
  },

  deleteNote: (id, currentUser) => {
    const notes = StorageService.getNotes();
    const target = notes.find(n => n.id === id);
    const updated = notes.filter(n => n.id !== id);
    StorageService.saveNotes(updated);

    // Notification for deletion (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} ลบโน้ต`,
        message: target ? target.title : 'โน้ต',
        targetTab: 'notes',
        targetId: null,
        user: currentUser
      });
    }

    return updated;
  },

  // STAGES (STATUS)
  getStages: () => {
    try {
      const saved = localStorage.getItem('home_stages');
      return saved ? JSON.parse(saved) : INITIAL_STAGES;
    } catch {
      return INITIAL_STAGES;
    }
  },

  saveStages: (stages) => {
    localStorage.setItem('home_stages', JSON.stringify(stages));
    StorageService.triggerAutoSync();
  },

  updateStage: (id, updates, currentUser) => {
    const stages = StorageService.getStages();
    const target = stages.find(s => s.id === id);
    const updated = stages.map(s => s.id === id ? { ...s, ...updates } : s);
    StorageService.saveStages(updated);

    // Notification for status update/edit (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} อัปเดตสถานะงาน`,
        message: target ? target.title : 'ขั้นตอนก่อสร้าง',
        targetTab: 'status',
        targetId: id,
        user: currentUser
      });
    }
    return updated;
  },

  deleteStage: (id, currentUser) => {
    const stages = StorageService.getStages();
    const target = stages.find(s => s.id === id);
    const updated = stages.filter(s => s.id !== id);
    StorageService.saveStages(updated);

    // Notification for deletion (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} ลบขั้นตอน`,
        message: target ? target.title : 'ขั้นตอนงาน',
        targetTab: 'status',
        targetId: null,
        user: currentUser
      });
    }
    return updated;
  },

  // FINANCES / EXPENSES
  getExpenses: () => {
    try {
      const saved = localStorage.getItem('home_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses: (expenses) => {
    localStorage.setItem('home_expenses', JSON.stringify(expenses));
    StorageService.triggerAutoSync();
  },

  addExpense: (expense) => {
    const expenses = StorageService.getExpenses();
    const newExpense = {
      ...expense,
      id: 'exp_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newExpense, ...expenses];
    StorageService.saveExpenses(updated);

    StorageService.addNotification({
      title: `${newExpense.paidBy} บันทึกรายจ่าย ฿${Number(newExpense.amount).toLocaleString()}`,
      message: newExpense.title,
      targetTab: 'finance',
      targetId: newExpense.id,
      user: newExpense.paidBy
    });

    return updated;
  },

  updateExpense: (id, updates, currentUser) => {
    const expenses = StorageService.getExpenses();
    const target = expenses.find(e => e.id === id);
    const updated = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
    StorageService.saveExpenses(updated);

    // Notification for edit (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} แก้ไขรายการจ่าย`,
        message: target ? target.title : 'รายการรายจ่าย',
        targetTab: 'finance',
        targetId: id,
        user: currentUser
      });
    }

    return updated;
  },

  deleteExpense: (id, currentUser) => {
    const expenses = StorageService.getExpenses();
    const target = expenses.find(e => e.id === id);
    const updated = expenses.filter(e => e.id !== id);
    StorageService.saveExpenses(updated);

    // Notification for deletion (Req 2)
    if (currentUser) {
      StorageService.addNotification({
        title: `${currentUser} ลบรายการจ่าย`,
        message: target ? target.title : 'รายการรายจ่าย',
        targetTab: 'finance',
        targetId: null,
        user: currentUser
      });
    }

    return updated;
  },

  // NOTIFICATIONS (Bell icon)
  getNotifications: () => {
    try {
      const saved = localStorage.getItem('home_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification: ({ title, message, targetTab, targetId, user }) => {
    const notis = StorageService.getNotifications();
    const newNoti = {
      id: 'noti_' + Date.now(),
      title,
      message,
      targetTab,
      targetId,
      user,
      date: 'เพิ่งเมื่อสักครู่',
      isRead: false
    };
    const updated = [newNoti, ...notis.slice(0, 30)];
    localStorage.setItem('home_notifications', JSON.stringify(updated));
    StorageService.triggerAutoSync();
    return updated;
  },

  markAllNotificationsRead: () => {
    const notis = StorageService.getNotifications();
    const updated = notis.map(n => ({ ...n, isRead: true }));
    localStorage.setItem('home_notifications', JSON.stringify(updated));
    StorageService.triggerAutoSync();
    return updated;
  },

  // HOUSE CUSTOMIZATION (Req 4: Image change & custom hotspots)
  getHouseImage: () => {
    return localStorage.getItem('home_house_image') || './images/project_contemporary_house.png';
  },

  saveHouseImage: (img) => {
    localStorage.setItem('home_house_image', img);
    StorageService.triggerAutoSync();
  },

  getHouseHotspots: (defaultHotspots) => {
    try {
      const saved = localStorage.getItem('home_house_hotspots');
      return saved ? JSON.parse(saved) : defaultHotspots;
    } catch {
      return defaultHotspots;
    }
  },

  saveHouseHotspots: (hotspots) => {
    localStorage.setItem('home_house_hotspots', JSON.stringify(hotspots));
    StorageService.triggerAutoSync();
  },

  // SYNC DIAGNOSTICS & STATUS
  getLastSyncTime: () => {
    return localStorage.getItem('home_last_sync_time') || null;
  },

  setLastSyncTime: (isoString) => {
    localStorage.setItem('home_last_sync_time', isoString || new Date().toISOString());
  },

  getLastSyncError: () => {
    return localStorage.getItem('home_last_sync_error') || null;
  },

  setLastSyncError: (err) => {
    if (err) {
      localStorage.setItem('home_last_sync_error', typeof err === 'string' ? err : JSON.stringify(err));
    } else {
      localStorage.removeItem('home_last_sync_error');
    }
  },

  getSyncStatus: () => {
    const config = getSupabaseConfig();
    const isConfigured = !!(config.url && config.key);
    const lastSyncTime = StorageService.getLastSyncTime();
    const lastError = StorageService.getLastSyncError();
    return {
      isConfigured,
      isConnected: isConfigured && !lastError,
      hasError: !!lastError,
      lastSyncTime,
      lastError
    };
  },

  // Test Supabase Connection & Permissions
  testConnection: async () => {
    if (!supabase) {
      return {
        success: false,
        error: 'ยังไม่ได้ระบุ Supabase Project URL หรือ Anon Key'
      };
    }

    try {
      // 1. Test reading from home_app_sync table
      const { data, error: readError } = await supabase
        .from('home_app_sync')
        .select('id, updated_at')
        .eq('id', 'rattanakorn_phase10')
        .maybeSingle();

      if (readError) {
        if (readError.message?.toLowerCase().includes('invalid path') || readError.message?.toLowerCase().includes('requested path')) {
          return {
            success: false,
            code: 'INVALID_PATH',
            error: 'URL หรือเส้นทางฐานข้อมูลไม่ถูกต้อง (ต้องเป็น https://<project-ref>.supabase.co เท่านั้น โดยไม่มี /rest/v1 หรือ / ต่อท้าย)'
          };
        }
        if (readError.code === '42P01') {
          return {
            success: false,
            code: 'TABLE_NOT_FOUND',
            error: 'ยังไม่พบตาราง home_app_sync ในฐานข้อมูล Supabase (กรุณากดปุ่ม "คัดลอก SQL" แล้วนำไปกด Run ใน Supabase SQL Editor)'
          };
        }
        if (readError.code === '42501' || readError.message?.toLowerCase().includes('policy') || readError.message?.toLowerCase().includes('permission')) {
          return {
            success: false,
            code: 'RLS_ERROR',
            error: 'ติดสิทธิ์ความปลอดภัย (Row Level Security) กรุณารันคำสั่ง SQL สร้าง Policy เพื่อเปิดสิทธิ์อ่าน/เขียน'
          };
        }
        return {
          success: false,
          code: readError.code || 'SUPABASE_ERROR',
          error: `Supabase ส่งคืนข้อผิดพลาด: ${readError.message || readError.code}`
        };
      }

      // 2. Test writing current data
      const syncRes = await StorageService.triggerAutoSync();
      if (syncRes.error) {
        return {
          success: false,
          error: `อ่านฐานข้อมูลสำเร็จ แต่ไม่สามารถบันทึกข้อมูลได้: ${syncRes.error}`
        };
      }

      return {
        success: true,
        message: 'เชื่อมต่อและซิงค์ข้อมูลกับ Supabase สำเร็จเรียบร้อยแล้ว!'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการทดสอบเชื่อมต่อ'
      };
    }
  },

  // EXPORT & IMPORT BACKUP (JSON)
  exportBackup: () => {
    try {
      const data = {
        notes: StorageService.getNotes(),
        stages: StorageService.getStages(),
        expenses: StorageService.getExpenses(),
        notifications: StorageService.getNotifications(),
        houseImage: StorageService.getHouseImage(),
        houseHotspots: StorageService.getHouseHotspots(null),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `baan_rattanakorn_backup_${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (err) {
      console.error('Failed to export backup:', err);
      return false;
    }
  },

  importBackup: (jsonContent) => {
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');
      }
      if (parsed.notes) localStorage.setItem('home_notes', JSON.stringify(parsed.notes));
      if (parsed.stages) localStorage.setItem('home_stages', JSON.stringify(parsed.stages));
      if (parsed.expenses) localStorage.setItem('home_expenses', JSON.stringify(parsed.expenses));
      if (parsed.notifications) localStorage.setItem('home_notifications', JSON.stringify(parsed.notifications));
      if (parsed.houseImage) localStorage.setItem('home_house_image', parsed.houseImage);
      if (parsed.houseHotspots) localStorage.setItem('home_house_hotspots', JSON.stringify(parsed.houseHotspots));

      StorageService.triggerAutoSync();
      return { success: true, data: parsed };
    } catch (err) {
      return { success: false, error: err.message || 'ไม่สามารถนำเข้าข้อมูลได้' };
    }
  },

  // CLOUD & LOCAL SYNC (Supabase 24/7 Cloud + Local Network Fallback)
  triggerAutoSync: async () => {
    const payload = {
      notes: StorageService.getNotes(),
      stages: StorageService.getStages(),
      expenses: StorageService.getExpenses(),
      notifications: StorageService.getNotifications(),
      houseImage: StorageService.getHouseImage(),
      houseHotspots: StorageService.getHouseHotspots(null),
      customTags: StorageService.getCustomTags(),
      timestamp: Date.now()
    };

    let cloudSuccess = false;
    let cloudError = null;

    // 1. Supabase Cloud Sync (24/7 across the globe)
    if (supabase) {
      try {
        const { error } = await supabase
          .from('home_app_sync')
          .upsert({
            id: 'rattanakorn_phase10',
            data: payload,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.warn('Supabase sync error:', error);
          cloudError = error.message || 'บันทึกข้อมูลไปยัง Supabase ไม่สำเร็จ';
          StorageService.setLastSyncError(cloudError);
        } else {
          cloudSuccess = true;
          StorageService.setLastSyncTime(new Date().toISOString());
          StorageService.setLastSyncError(null);
        }
      } catch (err) {
        console.warn('Supabase sync exception:', err);
        cloudError = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase';
        StorageService.setLastSyncError(cloudError);
      }
    }

    // 2. Local network fallback
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Offline fallback: localStorage is already saved!
    }

    return {
      success: cloudSuccess || !supabase,
      error: cloudError,
      payload
    };
  },

  pullServerSync: async () => {
    // 1. Try Supabase Cloud Sync first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('home_app_sync')
          .select('data, updated_at')
          .eq('id', 'rattanakorn_phase10')
          .maybeSingle();

        if (error) {
          console.warn('Supabase pull error:', error);
          StorageService.setLastSyncError(error.message);
        } else if (data && data.data) {
          const serverData = data.data;
          if (serverData.notes) localStorage.setItem('home_notes', JSON.stringify(serverData.notes));
          if (serverData.stages) localStorage.setItem('home_stages', JSON.stringify(serverData.stages));
          if (serverData.expenses) localStorage.setItem('home_expenses', JSON.stringify(serverData.expenses));
          if (serverData.notifications) localStorage.setItem('home_notifications', JSON.stringify(serverData.notifications));
          if (serverData.houseImage) localStorage.setItem('home_house_image', serverData.houseImage);
          if (serverData.houseHotspots) localStorage.setItem('home_house_hotspots', JSON.stringify(serverData.houseHotspots));
          if (serverData.customTags) localStorage.setItem('home_custom_tags', JSON.stringify(serverData.customTags));
          
          StorageService.setLastSyncTime(new Date().toISOString());
          StorageService.setLastSyncError(null);
          return serverData;
        } else if (!data) {
          // Record doesn't exist yet in Supabase -> push initial local data!
          await StorageService.triggerAutoSync();
        }
      } catch (err) {
        console.warn('Supabase pull exception:', err);
        StorageService.setLastSyncError(err.message);
      }
    }

    // 2. Try Local Network Sync fallback
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        if (data && data.timestamp) {
          if (data.notes) localStorage.setItem('home_notes', JSON.stringify(data.notes));
          if (data.stages) localStorage.setItem('home_stages', JSON.stringify(data.stages));
          if (data.expenses) localStorage.setItem('home_expenses', JSON.stringify(data.expenses));
          if (data.notifications) localStorage.setItem('home_notifications', JSON.stringify(data.notifications));
          if (data.houseImage) localStorage.setItem('home_house_image', data.houseImage);
          if (data.houseHotspots) localStorage.setItem('home_house_hotspots', JSON.stringify(data.houseHotspots));
          return data;
        }
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  // Realtime WebSocket Subscription (Instant cloud push)
  subscribeRealtimeSync: (callback) => {
    if (!supabase) return null;
    try {
      const channel = supabase
        .channel('home_realtime_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'home_app_sync',
            filter: 'id=eq.rattanakorn_phase10'
          },
          (payload) => {
            if (payload?.new?.data) {
              const serverData = payload.new.data;
              if (serverData.notes) localStorage.setItem('home_notes', JSON.stringify(serverData.notes));
              if (serverData.stages) localStorage.setItem('home_stages', JSON.stringify(serverData.stages));
              if (serverData.expenses) localStorage.setItem('home_expenses', JSON.stringify(serverData.expenses));
              if (serverData.notifications) localStorage.setItem('home_notifications', JSON.stringify(serverData.notifications));
              if (serverData.houseImage) localStorage.setItem('home_house_image', serverData.houseImage);
              if (serverData.houseHotspots) localStorage.setItem('home_house_hotspots', JSON.stringify(serverData.houseHotspots));
              if (serverData.customTags) localStorage.setItem('home_custom_tags', JSON.stringify(serverData.customTags));
              
              StorageService.setLastSyncTime(new Date().toISOString());
              StorageService.setLastSyncError(null);
              if (callback) callback(serverData);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return null;
    }
  }
};
