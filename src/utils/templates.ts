export interface InvitationTemplate {
  id: string;
  name: string;
  thumbnail?: string;
  html: string;
}

export const TEMPLATES: InvitationTemplate[] = [
  {
    id: "default",
    name: "Classic Box (Tuỳ chỉnh Cấp cao)",
    html: "" 
  },
  {
    id: "corporate_red",
    name: "Corporate Red (Giống Viettel)",
    html: `<div style="width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="width:100%;max-width:400px;padding:40px 20px;background:#c8102e;color:white;text-align:center;font-family:sans-serif;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.2);">
  <h2>{{company}}</h2>
  <p style="opacity:0.8;margin-bottom:5px;">Trân trọng kính mời</p>
  <h1 style="font-size:2em;margin:10px 0;">{{name}}</h1>
  <p style="opacity:0.8;margin-top:20px;">Tham dự chương trình</p>
  <h2 style="color:yellow;margin-top:5px;margin-bottom:30px;">{{event_name}}</h2>
  <div style="background:white;padding:15px;display:inline-block;border-radius:15px;box-shadow:0 10px 20px rgba(0,0,0,0.1);">
    <img src="{{qr}}" width="150" style="display:block;"/>
  </div>
  <p style="margin-top:30px;font-weight:bold;font-size:1.1em;">{{time}}</p>
  <p style="opacity:0.9;">{{location}}</p>
</div></div>`
  },
  {
    id: "luxury_black",
    name: "Luxury Black Gold (Sang trọng)",
    html: `<div style="width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="width:100%;max-width:400px;padding:40px 20px;background:#111;color:#d4af37;text-align:center;font-family:serif;border-radius:0;border:2px solid #d4af37;">
  <h3 style="letter-spacing:4px;font-size:0.9em;opacity:0.8;">INVITATION</h3>
  <h1 style="margin:20px 0 30px 0;font-size:2em;font-weight:normal;line-height:1.2;">{{event_name}}</h1>
  <p style="font-style:italic;color:#fff;">Dear {{name}},</p>
  <div style="padding:15px;display:inline-block;border:1px solid #d4af37;margin:30px 0;">
    <img src="{{qr}}" width="140" style="display:block;"/>
  </div>
  <p style="letter-spacing:2px;font-size:0.9em;text-transform:uppercase;">{{time}}</p>
  <p style="color:#888;">{{location}}</p>
</div></div>`
  },
  {
    id: "minimal_clean",
    name: "Minimal Clean (Hội thảo)",
    html: `<div style="width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:#f5f5f5;"><div style="width:100%;max-width:400px;padding:50px 30px;background:#fff;color:#333;font-family:Arial, sans-serif;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
  <h2 style="font-size:1.5em;color:#111;margin-bottom:30px;">{{event_name}}</h2>
  <p>Xin chào <b style="color:#111;">{{name}}</b>,</p>
  <p style="color:#666;line-height:1.5;">Bạn được mời tham dự sự kiện của chúng tôi. Vui lòng xuất trình mã QR này tại cổng check-in.</p>
  <div style="background:#f9f9f9;padding:20px;border-radius:12px;display:inline-block;margin:20px 0;">
    <img src="{{qr}}" width="150" style="display:block;"/>
  </div>
  <p style="margin:5px 0;font-size:0.9em;color:#555;"><b>Thời gian:</b> {{time}}</p>
  <p style="margin:5px 0;font-size:0.9em;color:#555;"><b>Địa điểm:</b> {{location}}</p>
</div></div>`
  },
  {
    id: "creative_gradient",
    name: "Creative Gradient (Công nghệ)",
    html: `<div style="width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="width:100%;max-width:400px;padding:50px 30px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;border-radius:30px;box-shadow:0 20px 50px rgba(118,75,162,0.3);">
  <h1 style="font-size:1.6em;font-weight:900;text-shadow:0 2px 10px rgba(0,0,0,0.2);margin-bottom:30px;">{{event_name}}</h1>
  <p style="font-size:1.1em;opacity:0.9;">Welcome</p>
  <h2 style="font-size:1.8em;margin:-5px 0 20px 0;">{{name}}</h2>
  <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:20px;display:inline-block;margin:10px 0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);">
    <div style="background:white;padding:10px;border-radius:10px;">
      <img src="{{qr}}" width="130" style="display:block;"/>
    </div>
  </div>
  <p style="margin-top:20px;font-weight:bold;">{{time}}</p>
  <p style="opacity:0.8;font-size:0.9em;">{{location}}</p>
</div></div>`
  },
  {
    id: "festive_gold",
    name: "Festive Gold (Tiệc Tất niên)",
    html: `<div style="width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;"><div style="width:100%;max-width:400px;padding:40px 20px;background:#b71c1c;color:#ffeb3b;text-align:center;font-family:Georgia, serif;border:10px solid #ffeb3b;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
  <h2 style="font-size:1.2em;margin-top:0;">{{company}}</h2>
  <p style="color:#fff;font-style:italic;">Trân trọng kính mời</p>
  <h1 style="font-size:2.2em;margin:10px 0;">{{name}}</h1>
  <h2 style="margin:30px 0;font-size:1.5em;text-transform:uppercase;">{{event_name}}</h2>
  <div style="background:white;padding:10px;display:inline-block;margin-bottom:20px;">
    <img src="{{qr}}" width="140" style="display:block;"/>
  </div>
  <p style="font-weight:bold;letter-spacing:1px;color:#fff;">{{time}}</p>
  <p style="color:#ffcc00;font-size:0.9em;">{{location}}</p>
</div></div>`
  }
];

export const renderTemplate = (html: string, data: Record<string, string>) => {
  let rendered = html;
  Object.keys(data).forEach(key => {
    // Escape string for regex safety if needed, simple replacement
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  return rendered;
};
