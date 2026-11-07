import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Home, Trees, LayoutGrid, Car, ChefHat, BedDouble, Bed, Armchair, Utensils, Bath, Camera, Plus, Edit3, Trash2, ZoomIn, RefreshCw, X, Check } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import ConfirmModal from '../components/ConfirmModal';
import ImageViewerModal from '../components/ImageViewerModal';
import OneDriveButton from '../components/OneDriveButton';
import CanvaButton from '../components/CanvaButton';
import { StorageService } from '../lib/storage';

// Default Contemporary House Hotspots
const DEFAULT_HOTSPOTS = [
  {
    id: 'hp_porch',
    number: '1',
    x: 20,
    y: 54,
    title: 'ซุ้มเฉลียงทางเข้าหน้าบ้าน (Arched Porch)',
    subtitle: 'เฉลียงยกระดับ +0.40 ม. ซุ้มโค้งโมเดิร์น',
    badge: 'ดีไซน์โครงการ',
    image: './images/project_contemporary_house.png',
    specs: [
      { label: 'ขนาดเฉลียง', value: '3.40 x 1.30 เมตร' },
      { label: 'ระดับพื้น', value: '+0.40 ม. (บันได 2 ขั้น)' },
      { label: 'ผิวสัมผัส', value: 'แกรนิตโต้กันลื่น R10' },
      { label: 'แสงสว่าง', value: 'โคมไฟกิ่งซุ้มเฉลียง Warm White' }
    ]
  },
  {
    id: 'hp_roof',
    number: '2',
    x: 52,
    y: 22,
    title: 'หลังคาปั้นหยา SCG ลอนเอลาบานา 25°',
    subtitle: 'ทรงปั้นหยาร่วมสมัย ระดับสันหลังคา +6.18 ม.',
    badge: 'โครงสร้างหลังคา',
    image: './images/project_contemporary_house.png',
    specs: [
      { label: 'ชนิดกระเบื้อง', value: 'SCG ลอนเอลาบานา' },
      { label: 'สีหลังคา', value: 'เทาแทนทาลัม (Tantalum Grey)' },
      { label: 'ความลาดชัน', value: '25 องศา ระบายน้ำไว' },
      { label: 'ระแนงใต้ชายคา', value: 'กรุไม้เทียมสีอบอุ่นตามแบบ' }
    ]
  },
  {
    id: 'hp_windows',
    number: '3',
    x: 20,
    y: 64,
    title: 'หน้าต่างซุ้มโค้ง Arch ห้องนอน 2 (หน้าบ้าน)',
    subtitle: 'รับแดดยามเช้าทิศตะวันออก',
    badge: 'เอกลักษณ์บ้าน',
    image: './images/project_contemporary_house.png',
    specs: [
      { label: 'ช่องแสง', value: 'บานโค้ง Arch สไตล์คอนเทมโพรารี' },
      { label: 'กรอบเฟรม', value: 'อลูมิเนียมลายไม้ธรรมชาติ' },
      { label: 'กระจก', value: 'กระจกใสตัดแสง 6 มม.' },
      { label: 'ทิศทาง', value: 'ทิศเหนือ รับแสงธรรมชาติ ไม่ร้อน' }
    ]
  },
  {
    id: 'hp_carport',
    number: '4',
    x: 55,
    y: 56,
    title: 'โรงจอดรถในร่ม 2 คัน (Carport ซุ้มโค้ง)',
    subtitle: 'เสาช่วงกว้าง 5.55 ม. จอดรถ 2 คันสบาย',
    badge: 'ปีกทิศตะวันตก',
    image: './images/project_contemporary_house.png',
    specs: [
      { label: 'ขนาดโรงรถ', value: 'กว้างเสา 5.55 ม. x ลึก 6.00 ม.' },
      { label: 'ระดับพื้น', value: '+0.10 ม. (ค.ส.ล. ขัดหยาบ)' },
      { label: 'ซุ้มโค้ง', value: 'เสาคอนกรีตซุ้ม Arch สไตล์โครงการ' },
      { label: 'รถจอด', value: 'รองรับรถ SUV / Sedan 2 คัน' }
    ]
  },
  {
    id: 'hp_finish',
    number: '5',
    x: 82,
    y: 60,
    title: 'ผนังฉาบเรียบขาวนวล & งานไม้กรุชายคา',
    subtitle: 'โทนสว่าง สะอาดตา สไตล์ Contemporary',
    badge: 'ผิวอาคาร',
    image: './images/project_contemporary_house.png',
    specs: [
      { label: 'สีผนัง', value: 'ขาวนวลประกายมุก ทนแดดฝน' },
      { label: 'งานไม้', value: 'ระแนงไม้กรุชายคาโทนอุ่น' },
      { label: 'ฐานล่าง', value: 'ตัดขอบสีเทาป้องกันคราบเปื้อน' },
      { label: 'แสงไฟผนัง', value: 'ไฟส่องขึ้น-ลง Cylinder Wall Lamp' }
    ]
  }
];

// Outdoor Zones
const OUTDOOR_ZONES = [
  {
    id: 'zone_garden',
    title: '🌿 สวนทิศตะวันตก 10 เมตร (~140 ตร.ม.)',
    subtitle: 'พื้นที่ว่างติดห้องนอนใหญ่ (10.00 x 14.45 ม.)',
    badge: 'โซนธรรมชาติ',
    image: './images/cadastral_survey.jpg',
    specs: [
      { label: 'ขนาดพื้นที่', value: 'หน้ากว้าง 10.00 ม. x ลึก 14.45 ม.' },
      { label: 'ที่จอดรถเสริม', value: 'บล็อกหญ้า Eco Paver 3x5 ม.' },
      { label: 'แดด & ลม', value: 'แดดบ่ายทิศตะวันตก' },
      { label: 'ฟังก์ชัน', value: 'ปลูกไม้บังแดดให้ห้องนอนใหญ่' }
    ]
  },
  {
    id: 'zone_dual_gate',
    title: '🚪 ระบบประตูรั้ว 2 บาน (Dual Gate System)',
    subtitle: 'หน้ากว้าง 26.22 ม. ติดถนนสาธารณะ 8 ม.',
    badge: 'ทางเข้าหลัก',
    image: './images/perspective_dual_gate.jpg',
    specs: [
      { label: 'ประตูเลื่อนโรงรถ', value: 'กว้าง 5.20 ม. เลื่อนไปทิศตะวันออก' },
      { label: 'ประตูสวนสวิงคู่', value: 'กว้าง 3.20 ม. (บานละ 1.60 ม.)' },
      { label: 'การเปิดสวิง', value: 'สวิงเข้าสวนในมุม 90-100°' },
      { label: 'แก้ปัญหาเสาบ้าน', value: 'รถเข้าสวนได้ตรง ไม่ติดเสาโรงรถ' }
    ]
  },
  {
    id: 'zone_washing',
    title: '🧺 ลานซักล้าง & ระบบน้ำหลังบ้าน',
    subtitle: 'หันหน้าทิศใต้ รับลมมรสุมเต็มๆ',
    badge: 'งานระบบ',
    image: './images/interior_kitchen.png',
    specs: [
      { label: 'ระดับพื้น', value: '+0.10 ม. เชื่อมต่อห้องครัว' },
      { label: 'ถังเก็บน้ำ', value: 'ถังสำรองน้ำ 1,500 ลิตร' },
      { label: 'ปั๊มน้ำ', value: 'ปั๊มน้ำอัตโนมัติแรงดันคงที่' },
      { label: 'การตากผ้า', value: 'แดดบ่ายและลมใต้ ผ้าแห้งไว' }
    ]
  }
];

// Indoor Rooms
const INDOOR_ROOMS = [
  {
    id: 'room_living',
    title: 'โถงรับแขก & นั่งเล่น (Living Area)',
    subtitle: 'เพดานสูง 3.00 ม. โปร่งโล่ง',
    badge: 'โซนต้อนรับ',
    icon: Armchair,
    image: './images/interior_living.png',
    dimensions: '4.00 x 4.40 ม. (17.6 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 4.40 เมตร' },
      { label: 'ความสูงฝ้า', value: '3.00 เมตร โปร่งโล่ง' },
      { label: 'วัสดุพื้น', value: 'แกรนิตโต้ 60x60 ซม. (F1)' },
      { label: 'ผนังตกแต่ง', value: 'ระแนงไม้ WPC ผนังทีวี (W4)' }
    ]
  },
  {
    id: 'room_dining',
    title: 'โซนทานอาหาร (Dining Area)',
    subtitle: 'เชื่อมต่อห้องนั่งเล่นแบบ Open-Plan',
    badge: 'ครอบครัว',
    icon: Utensils,
    image: './images/interior_dining.png',
    dimensions: '4.00 x 3.00 ม. (12.0 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 3.00 เมตร' },
      { label: 'ความจุ', value: 'โต๊ะทานอาหาร 6 ที่นั่ง' },
      { label: 'ทางเชื่อม', value: 'ซุ้มโค้ง Archway ไปห้องนอน' },
      { label: 'แสงสว่าง', value: 'โคมไฟแขวนสไตล์ร่วมสมัย' }
    ]
  },
  {
    id: 'room_kitchen',
    title: 'ห้องครัวปิด (Kitchen)',
    subtitle: 'ประตูกระจกบานเลื่อนกั้นกลิ่นอาหาร',
    badge: 'ครัวไทย-ฝรั่ง',
    icon: ChefHat,
    image: './images/interior_kitchen.png',
    dimensions: '4.00 x 2.50 ม. (10.0 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 2.50 เมตร' },
      { label: 'เคาน์เตอร์', value: 'เคาน์เตอร์ปูนกรุกระเบื้อง' },
      { label: 'การระบายกลิ่น', value: 'หน้าต่าง 2 ด้าน + พัดลมดูด' },
      { label: 'ประตูหลังบ้าน', value: 'เปิดออกสู่ลานซักล้าง' }
    ]
  },
  {
    id: 'room_master',
    title: 'ห้องนอนใหญ่ (Master Bedroom)',
    subtitle: 'ห้องน้ำในตัว ทิศตะวันตกติดสวน',
    badge: 'ห้องนอนหลัก',
    icon: BedDouble,
    image: './images/interior_master.png',
    dimensions: '4.30 x 3.50 ม. (15.05 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.30 x 3.50 เมตร' },
      { label: 'ห้องน้ำในตัว', value: 'ขนาด 1.70 x 3.00 ม. (ครบชุด)' },
      { label: 'วัสดุพื้น', value: 'ไวนิล SPC 4mm นุ่มเท้า กันน้ำ' },
      { label: 'การบังแดด', value: 'แนวต้นไม้สวน 10 ม. ช่วยกรองแดด' }
    ]
  },
  {
    id: 'room_bed2',
    title: 'ห้องนอน 2 ซุ้มโค้ง (Bedroom 2)',
    subtitle: 'ห้องนอนหน้าบ้าน หน้าต่างโค้ง 3 บาน',
    badge: 'วิวหน้าบ้าน',
    icon: Bed,
    image: './images/interior_bedroom.png',
    dimensions: '4.00 x 4.40 ม. (17.6 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 4.40 เมตร (กว้างขวาง)' },
      { label: 'ช่องแสง', value: 'หน้าต่างซุ้มโค้ง 3 บานติดกัน' },
      { label: 'ทิศทางแดด', value: 'แดดเช้าทิศตะวันออก ห้องเย็นสบาย' },
      { label: 'ความสูงฝ้า', value: '3.00 เมตร โปร่งโล่ง' }
    ]
  },
  {
    id: 'room_bed1',
    title: 'ห้องนอน 1 / ทำงาน (Bedroom 1)',
    subtitle: 'ห้องนอนหลังบ้านฝั่งตะวันออก',
    badge: 'อเนกประสงค์',
    icon: Bed,
    image: './images/interior_dining.png',
    dimensions: '4.00 x 3.50 ม. (14.0 ตร.ม.)',
    specs: [
      { label: 'ขนาดห้อง', value: '4.00 x 3.50 เมตร' },
      { label: 'ฟังก์ชันแปรผัน', value: 'ห้องนอนแขก / Home Office' },
      { label: 'หน้าต่าง', value: 'เปิดรับลมทิศใต้และตะวันออก' },
      { label: 'ความเงียบ', value: 'โซนส่วนตัวหลังบ้าน' }
    ]
  }
];

export default function HouseBlueprintPage({ notes, onAddNote, currentUser }) {
  const isJob = currentUser === 'JOB';

  // Sub-tabs
  const [subTab, setSubTab] = useState('house3d'); // 'house3d' | 'outdoor' | 'indoor'
  const [activeItem, setActiveItem] = useState(null);

  // House Customization States (Req 4)
  const [houseImage, setHouseImage] = useState(() => StorageService.getHouseImage());
  const [hotspots, setHotspots] = useState(() => StorageService.getHouseHotspots(DEFAULT_HOTSPOTS));

  // Gate simulator state
  const [isSlidingOpen, setIsSlidingOpen] = useState(false);
  const [isSwingOpen, setIsSwingOpen] = useState(false);

  // Adding/Editing Hotspot States (Req 4, 6)
  const [isPlacingPoint, setIsPlacingPoint] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null); // { x, y }
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [hotspotTitle, setHotspotTitle] = useState('');
  const [hotspotSubtitle, setHotspotSubtitle] = useState('');
  const [hotspotNumber, setHotspotNumber] = useState('');
  const [hotspotSpecs, setHotspotSpecs] = useState([]); // [{ label: '', value: '' }] (Req 6)

  // Delete Confirmation State (Req 1)
  const [hotspotToDelete, setHotspotToDelete] = useState(null);

  // Fullscreen Image Lightbox State (Req 2)
  const [viewingImage, setViewingImage] = useState(null);

  const imageContainerRef = useRef(null);

  // Change house image (Req 4)
  const handleHouseImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setHouseImage(result);
        StorageService.saveHouseImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetHouseImage = () => {
    const defaultImg = './images/project_contemporary_house.png';
    setHouseImage(defaultImg);
    StorageService.saveHouseImage(defaultImg);
  };

  // Click on image when placing point
  const handleImageClick = (e) => {
    if (!isPlacingPoint || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setPendingCoords({ x, y });
    setHotspotTitle('');
    setHotspotSubtitle('');
    setHotspotNumber(String(hotspots.length + 1));
    setHotspotSpecs([
      { label: 'ขนาด', value: '' },
      { label: 'วัสดุ', value: '' }
    ]);
    setEditingHotspot({ isNew: true });
    setIsPlacingPoint(false);
  };

  // Save Hotspot (Add or Edit)
  const handleSaveHotspot = (e) => {
    e.preventDefault();
    if (!hotspotTitle.trim()) return;

    // Filter valid specs (Req 6)
    const validSpecs = hotspotSpecs.filter(s => s.label.trim() && s.value.trim());

    let updated;
    if (editingHotspot?.isNew && pendingCoords) {
      const newHp = {
        id: 'hp_' + Date.now(),
        number: hotspotNumber || String(hotspots.length + 1),
        x: pendingCoords.x,
        y: pendingCoords.y,
        title: hotspotTitle.trim(),
        subtitle: hotspotSubtitle.trim() || 'จุดกำหนดเอง',
        badge: 'จุดกำหนดเอง',
        image: houseImage,
        specs: validSpecs
      };
      updated = [...hotspots, newHp];
    } else if (editingHotspot) {
      updated = hotspots.map(hp => hp.id === editingHotspot.id ? {
        ...hp,
        title: hotspotTitle.trim(),
        subtitle: hotspotSubtitle.trim(),
        number: hotspotNumber || hp.number,
        specs: validSpecs
      } : hp);
    }

    if (updated) {
      setHotspots(updated);
      StorageService.saveHouseHotspots(updated);
      if (activeItem?.id === editingHotspot?.id) {
        setActiveItem(updated.find(h => h.id === editingHotspot.id));
      }
    }

    setEditingHotspot(null);
    setPendingCoords(null);
  };

  // Open Edit Hotspot from BottomSheet
  const handleOpenEditHotspot = (hp) => {
    setEditingHotspot(hp);
    setHotspotTitle(hp.title);
    setHotspotSubtitle(hp.subtitle || '');
    setHotspotNumber(hp.number || '');
    setHotspotSpecs(hp.specs && hp.specs.length > 0 ? [...hp.specs] : [
      { label: 'ขนาด', value: '' },
      { label: 'วัสดุ', value: '' }
    ]);
    setActiveItem(null);
  };

  const currentNotes = activeItem ? notes.filter(n => n.zoneId === activeItem.id) : [];

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      
      {/* Sub-Tabs Control Pills (Req 7) */}
      <div className="flex p-1 bg-amber-100/70 dark:bg-stone-900 rounded-2xl text-xs font-bold text-stone-600 dark:text-stone-300 shadow-xs border border-transparent dark:border-stone-800">
        <button
          onClick={() => setSubTab('house3d')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            subTab === 'house3d' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs' : 'hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          🏠 ตัวบ้าน 3D
        </button>
        <button
          onClick={() => setSubTab('outdoor')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            subTab === 'outdoor' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs' : 'hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          🌳 สวน & รั้ว 10m
        </button>
        <button
          onClick={() => setSubTab('indoor')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            subTab === 'indoor' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs' : 'hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          🛋️ แปลนในบ้าน
        </button>
      </div>

      {/* Project Vaults: OneDrive & Canva Design Hub */}
      <div className="space-y-2.5">
        <OneDriveButton variant="card" />
        <CanvaButton variant="card" />
      </div>

      {/* ================= SUB-TAB 1: CONTEMPORARY HOUSE 3D (Req 4, 6) ================= */}
      {subTab === 'house3d' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* Controls: Change Image & Add Hotspot (Req 4) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Change Image Button */}
              <label className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold shadow-xs cursor-pointer active:scale-95 hover:bg-stone-50 dark:hover:bg-stone-800">
                <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>เปลี่ยนรูปบ้าน</span>
                <input type="file" accept="image/*" onChange={handleHouseImageUpload} className="hidden" />
              </label>

              {houseImage !== './images/project_contemporary_house.png' && (
                <button
                  onClick={handleResetHouseImage}
                  className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  title="คืนค่ารูปโครงการเดิม"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Add Hotspot Button (Req 4) */}
            <button
              onClick={() => setIsPlacingPoint(!isPlacingPoint)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs active:scale-95 transition-all ${
                isPlacingPoint ? 'bg-amber-600 ring-2 ring-amber-300' : isJob ? 'bg-sky-600' : 'bg-rose-500'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isPlacingPoint ? 'แตะบนภาพเพื่อปัก' : 'เพิ่มจุดบนภาพ'}</span>
            </button>
          </div>

          {/* Placement Mode Active Banner */}
          {isPlacingPoint && (
            <div className="p-2.5 bg-amber-500 text-stone-950 rounded-2xl text-xs font-bold flex items-center justify-between animate-pulse shadow-md">
              <span>📍 แตะบนภาพตัวบ้านตรงจุดที่ต้องการปักหมุดใหม่</span>
              <button onClick={() => setIsPlacingPoint(false)} className="p-1 rounded-full bg-black/10">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Contemporary House Viewport with Interactive Pins */}
          <div 
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={`relative rounded-3xl overflow-hidden border border-stone-200 shadow-md bg-stone-950 aspect-[16/10] select-none ${
              isPlacingPoint ? 'cursor-crosshair ring-4 ring-amber-400' : ''
            }`}
          >
            <img 
              src={houseImage} 
              alt="Contemporary Style House - โครงการบ้านรัตนาภร เฟส 8" 
              className="w-full h-full object-cover"
            />

            {/* Zero-clutter minimal numbered pulsing pins */}
            {hotspots.map((hp) => (
              <button
                key={hp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPlacingPoint) setActiveItem(hp);
                }}
                style={{ left: `${hp.x}%`, top: `${hp.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                aria-label={hp.title}
              >
                <span className="relative flex h-8 w-8 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex items-center justify-center rounded-full h-6 w-6 bg-amber-500 text-stone-950 text-xs font-black shadow-lg border-2 border-white">
                    {hp.number}
                  </span>
                </span>
              </button>
            ))}

            {/* Fullscreen Zoom & Save Trigger on image (Req 2) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingImage({ src: houseImage, alt: 'แบบบ้าน Contemporary Style House' });
              }}
              className="absolute top-3 right-3 p-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md active:scale-95 shadow-md flex items-center gap-1 text-[10px] font-bold"
              title="ดูภาพเต็ม & เซฟลงเครื่อง"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>ดูเต็มจอ</span>
            </button>

            <div className="absolute bottom-2 inset-x-3 text-center pointer-events-none">
              <span className="text-[10px] bg-stone-950/70 text-stone-200 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10 font-medium">
                แตะที่จุด ① ② ③ เพื่อดูสเปก หรือกด "เพิ่มจุดบนภาพ" ด้านบน
              </span>
            </div>
          </div>

          {/* Project Details Description Card */}
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 text-xs space-y-1 shadow-xs">
            <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-100">
              <span>🏡 แบบบ้าน Contemporary Style House (โครงการเฟส 8)</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                ตามแบบโครงการ
              </span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              แบบบ้านเดี่ยว 1 ชั้นร่วมสมัย โทนสว่าง ซุ้มโค้งโมเดิร์น พร้อมโรงจอดรถในร่ม 2 คัน (หน้ากว้างตัวบ้าน 14.00 ม. ลึก 10.20 ม.)
            </p>
          </div>

          {/* Hotspots Quick Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {hotspots.map(hp => (
              <button
                key={hp.id}
                onClick={() => setActiveItem(hp)}
                className="text-left p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 active:scale-98 transition-all space-y-1 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-[10px]">
                    {hp.number}
                  </span>
                  <span className="text-[9px] text-stone-400 dark:text-stone-500">{hp.badge}</span>
                </div>
                <p className="font-bold text-stone-800 dark:text-stone-100 truncate text-[11px]">
                  {hp.title.split('(')[0]}
                </p>
              </button>
            ))}
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 2: OUTDOOR & GARDEN ================= */}
      {subTab === 'outdoor' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* Site Dimension Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">ขนาดที่ดินจริง 26.22 x 14.45 ม.</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">~95 ตารางวา</span>
            </div>
            <h3 className="text-sm font-bold">หน้าบ้านหันทิศเหนือ (ติดถนน 8.00 ม.)</h3>
            <p className="text-[11px] text-emerald-100">
              สวน 10 เมตรฝั่งตะวันตก + โรงรถ 6 เมตร + ตัวบ้าน 8 เมตร และระยะร่น 2 เมตรฝั่งตะวันออก
            </p>
          </div>

          {/* Gate Simulator */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
              <span>🚪</span> ทดสอบระบบประตูรั้ว 2 บาน (Dual Gate)
            </h4>

            <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 select-none">
              <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                <span>ฝั่งตะวันตก (สวน 10m)</span>
                <span>โรงรถ (6m)</span>
                <span>ฝั่งตะวันออก (10m)</span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 h-16 items-center">
                <div 
                  onClick={() => setIsSwingOpen(!isSwingOpen)}
                  className={`col-span-4 h-full rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSwingOpen 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span className="text-[10px] font-bold">ประตูสวิง 3.2m</span>
                  <span className="text-[9px]">{isSwingOpen ? '🟢 สวิงเข้าสวน' : '🔴 ปิด'}</span>
                </div>

                <div 
                  onClick={() => setIsSlidingOpen(!isSlidingOpen)}
                  className={`col-span-5 h-full rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSlidingOpen 
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 translate-x-2' 
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span className="text-[10px] font-bold">ประตูเลื่อน 5.2m</span>
                  <span className="text-[9px]">{isSlidingOpen ? '🟢 สไลด์ขวา' : '🔴 ปิด'}</span>
                </div>

                <div className="col-span-3 h-full rounded-2xl bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[9px] text-stone-600 dark:text-stone-300 font-bold">รั้วทึบ</span>
                  <span className="text-[8px] text-stone-400 dark:text-stone-500">รางเก็บประตู</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1 text-xs">
                <button
                  onClick={() => setIsSwingOpen(!isSwingOpen)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold active:scale-95 shadow-xs"
                >
                  สวิงเข้าสวน ({isSwingOpen ? 'ปิด' : 'เปิด'})
                </button>
                <button
                  onClick={() => setIsSlidingOpen(!isSlidingOpen)}
                  className="flex-1 py-1.5 rounded-xl bg-sky-600 text-white font-bold active:scale-95 shadow-xs"
                >
                  เลื่อนโรงรถ ({isSlidingOpen ? 'ปิด' : 'เปิด'})
                </button>
              </div>
            </div>
          </div>

          {/* Outdoor Zones List */}
          <div className="space-y-2">
            {OUTDOOR_ZONES.map(zone => (
              <div
                key={zone.id}
                onClick={() => setActiveItem(zone)}
                className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer shadow-xs transition-all active:scale-98 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {zone.badge}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">{zone.subtitle}</span>
                </div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100">{zone.title}</h4>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 3: INDOOR 7 ROOMS ================= */}
      {subTab === 'indoor' && (
        <div className="space-y-3.5 animate-fade-in">
          
          {/* Floorplan Banner with Click-to-Zoom (Req 2) */}
          <div className="bg-stone-900 text-white p-4 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">ผังพื้นที่ภายใน 102.80 ตร.ม.</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                3 นอน 2 น้ำ
              </span>
            </div>

            <div 
              onClick={() => setViewingImage({ src: './images/architect_floorplan.jpg', alt: 'แปลนสถาปัตยกรรมชั้น 1' })}
              className="rounded-2xl overflow-hidden border border-stone-700 bg-stone-950 cursor-pointer relative group"
              title="แตะเพื่อดูภาพแปลนเต็มจอ & บันทึก"
            >
              <img src="./images/architect_floorplan.jpg" alt="Floorplan OP 1" className="w-full h-auto object-contain" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                  <ZoomIn className="w-3.5 h-3.5" /> ดูแปลนเต็ม & เซฟ
                </span>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 text-center">
              แปลนสถาปัตยกรรม (OP 1) ฝ้าเพดานสูง 3.00 เมตร โปร่งโล่ง (แตะรูปเพื่อดูเต็มจอ)
            </p>
          </div>

          {/* Rooms Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-600 dark:text-stone-400">
              🛋️ แตะห้องเพื่อดูรูป 3D และโน้ตบิวท์อิน
            </h4>

            <div className="space-y-2">
              {INDOOR_ROOMS.map(room => {
                const Icon = room.icon;
                const roomNotesCount = notes.filter(n => n.zoneId === room.id).length;

                return (
                  <div
                    key={room.id}
                    onClick={() => setActiveItem(room)}
                    className="p-3 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer shadow-xs transition-all active:scale-98 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100">{room.title}</h4>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">{room.dimensions}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {roomNotesCount > 0 ? `${roomNotesCount} โน้ต` : room.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Shared Bottom Sheet Drawer with Edit/Delete Hotspot buttons (Req 4) */}
      <BottomSheet
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.title}
        subtitle={activeItem?.subtitle || activeItem?.dimensions}
        badge={activeItem?.badge}
        image={activeItem?.image}
        specs={activeItem?.specs}
        notes={currentNotes}
        currentUser={currentUser}
        onImageClick={(src, alt) => setViewingImage({ src, alt })}
        onEditHotspot={activeItem?.id?.startsWith('hp_') ? () => handleOpenEditHotspot(activeItem) : null}
        onDeleteHotspot={activeItem?.id?.startsWith('hp_') ? () => setHotspotToDelete(activeItem) : null}
        onAddNote={(newNote) => {
          onAddNote({
            ...newNote,
            pageId: 'house',
            zoneId: activeItem.id
          });
        }}
      />

      {/* Add / Edit Hotspot Modal (Req 4) */}
      {editingHotspot && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleSaveHotspot} className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {editingHotspot?.isNew ? '📍 ปักหมุดจุดใหม่บนภาพ' : '✏️ แก้ไขข้อมูลจุดนี้'}
              </span>
              <button type="button" onClick={() => setEditingHotspot(null)} className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">หมายเลข</label>
                <input
                  type="text"
                  value={hotspotNumber}
                  onChange={(e) => setHotspotNumber(e.target.value)}
                  placeholder="1"
                  className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">ชื่อจุด / ชิ้นส่วน</label>
                <input
                  type="text"
                  placeholder="เช่น ซุ้มประตู, แนวไฟกิ่ง, กันสาด"
                  value={hotspotTitle}
                  onChange={(e) => setHotspotTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block mb-1">คำอธิบายย่อ</label>
              <input
                type="text"
                placeholder="เช่น ระดับ +0.40 ม., ไฟ Warm White"
                value={hotspotSubtitle}
                onChange={(e) => setHotspotSubtitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Custom Construction Specs Builder (Req 6) */}
            <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <span>📐</span> สเปกก่อสร้าง (ระบุได้เอง)
                </span>
                <button
                  type="button"
                  onClick={() => setHotspotSpecs([...hotspotSpecs, { label: '', value: '' }])}
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60"
                >
                  + เพิ่มสเปก
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {hotspotSpecs.length === 0 ? (
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 italic">ยังไม่มีสเปก กด "+ เพิ่มสเปก" ด้านบนได้เลย</p>
                ) : (
                  hotspotSpecs.map((spec, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <input
                        type="text"
                        placeholder="เช่น ขนาด / วัสดุ"
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...hotspotSpecs];
                          updated[i].label = e.target.value;
                          setHotspotSpecs(updated);
                        }}
                        className="w-1/3 text-[11px] p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="เช่น 3.40x1.30 ม. / แกรนิตโต้"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...hotspotSpecs];
                          updated[i].value = e.target.value;
                          setHotspotSpecs(updated);
                        }}
                        className="flex-1 text-[11px] p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setHotspotSpecs(hotspotSpecs.filter((_, idx) => idx !== i))}
                        className="p-1 text-stone-400 hover:text-rose-500 dark:hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingHotspot(null)}
                className="flex-1 py-2.5 rounded-2xl text-xs bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md ${isJob ? 'bg-sky-600' : 'bg-rose-500'}`}
              >
                บันทึกจุดนี้
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Delete Hotspot Confirmation Modal (Req 1 & 4) */}
      <ConfirmModal
        isOpen={!!hotspotToDelete}
        title="ยืนยันการลบจุดบนภาพ"
        message={`คุณต้องการลบจุด "${hotspotToDelete?.title}" ออกจากภาพบ้านหรือไม่?`}
        onConfirm={() => {
          if (hotspotToDelete) {
            const updated = hotspots.filter(h => h.id !== hotspotToDelete.id);
            setHotspots(updated);
            StorageService.saveHouseHotspots(updated);
            setHotspotToDelete(null);
            setActiveItem(null);
          }
        }}
        onCancel={() => setHotspotToDelete(null)}
      />

      {/* Fullscreen Image Lightbox Modal with Download (Req 2) */}
      <ImageViewerModal
        isOpen={!!viewingImage}
        src={viewingImage?.src}
        alt={viewingImage?.alt}
        onClose={() => setViewingImage(null)}
      />

    </div>
  );
}
