const fs = require('fs');
const files = [
  'playnsports/client/src/pages/Login.jsx',
  'playnsports/client/src/pages/Register.jsx',
  'playnsports/client/src/pages/OTPLogin.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  // Fix background of google btn, otp btn, role options
  c = c.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.0[34]\);/g, 'background: var(--glass-05);');
  
  // Fix text color of OTP/Google buttons which is statically 0.7 or 0.8 opacity white
  c = c.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.[78]\);/g, 'color: var(--text-main);');
  
  // Fix text color of divider lines (0.15 opacity white) and ghost btns (0.35)
  c = c.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.1[0-9]\);/g, 'color: var(--text-muted);');
  c = c.replace(/color:\s*rgba\(255,\s*255,\s*255,\s*0\.3[0-9]\);/g, 'color: var(--text-muted);');

  fs.writeFileSync(f, c);
  console.log('Fixed auth buttons in', f);
});
