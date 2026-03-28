// Global Design System - Annadata Enterprise OS
// "Flat, professional, data-dense, NO rounded edges, NO glassmorphism"

export const theme = {
  colors: {
    sidebarBase: "#13311c",       // Dark green sidebar
    sidebarAccent: "#386542",     // Selection state
    sidebarText: "#ffffff",
    sidebarBrand: "#d4cb7e",      // Yellowish brand text
    
    mainBg: "#fbfaf5",            // Light beige background
    cardBg: "#ffffff",
    cardBorder: "#e5e3d7",
    
    textMain: "#1a1a1a",
    textMuted: "#666666",
    
    // Severity & Status
    error: "#c82b28",             // Red
    warning: "#e18b2c",           // Orange
    info: "#3174a1",              // Blue
    success: "#408447",           // Green
  },
  
  classes: {
    // LAYOUTS
    layoutBase: "min-h-screen bg-[#fbfaf5] text-[#1a1a1a] font-hind flex",
    
    // CARDS & CONTAINERS
    card: "bg-white border border-[#e5e3d7] shadow-sm rounded-none overflow-hidden",
    statCardWrap: "bg-white border border-[#e5e3d7] shadow-sm rounded-none p-5 relative",
    statGroup: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6",
    
    // SPECIFIC WIDGETS (Top Borders like reference image)
    borderTopGreen: "border-t-[3px] border-t-[#408447]",
    borderTopOrange: "border-t-[3px] border-t-[#e18b2c]",
    borderTopBlue: "border-t-[3px] border-t-[#3174a1]",
    borderTopYellow: "border-t-[3px] border-t-[#d4cb7e]",
    
    // BUTTONS
    btnPrimary: "bg-[#13311c] text-white rounded-none px-4 py-2 text-sm font-bold border border-transparent hover:bg-[#386542] transition-colors flex items-center justify-center gap-2",
    btnOutline: "bg-white text-[#13311c] rounded-none px-4 py-2 text-sm font-bold border border-[#e5e3d7] hover:border-[#13311c] transition-colors flex items-center justify-center gap-2",
    
    // TYPOGRAPHY
    heading1: "font-mukta font-bold text-2xl text-[#1a1a1a]",
    heading2: "font-mukta font-bold text-lg text-[#1a1a1a]",
    bodyText: "font-hind text-sm text-[#333333]",
    caption: "font-hind text-xs text-[#666666]",
    
    // INPUTS
    inputWrapper: "bg-white border border-[#e5e3d7] rounded-none focus-within:border-[#13311c] transition-colors flex items-center",
    inputText: "w-full bg-transparent border-none outline-none font-hind text-[#1a1a1a] placeholder:text-[#999999] px-3 py-2 text-sm",
    
    // BADGES
    badgeSuccess: "bg-[#408447]/10 text-[#408447] rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border border-[#408447]/20",
    badgeWarning: "bg-[#e18b2c]/10 text-[#e18b2c] rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border border-[#e18b2c]/20",
    badgeError: "bg-[#c82b28]/10 text-[#c82b28] rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border border-[#c82b28]/20",
    badgeInfo: "bg-[#3174a1]/10 text-[#3174a1] rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border border-[#3174a1]/20",
  }
};
