// Vintage Minimalist Greeting Card - Canvas Page Renderer
// Generates high-DPI (Retina 2x) vector-crisp page images for StPageFlip canvas deformation engine

class CardPageRenderer {
  constructor(width = 320, height = 460, scale = 2) {
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.canvasWidth = width * scale;
    this.canvasHeight = height * scale;
  }

  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');
    ctx.scale(this.scale, this.scale);
    return { canvas, ctx };
  }

  // Draw authentic natural cotton paper background with subtle fiber tone
  drawPaperBase(ctx) {
    const w = this.width;
    const h = this.height;

    // Warm natural cream cardstock
    ctx.fillStyle = '#faf7f0';
    ctx.fillRect(0, 0, w, h);

    // Subtle ambient gradient (lighter in top-center, soft shading towards edges)
    const radial = ctx.createRadialGradient(w / 2, h * 0.3, 10, w / 2, h / 2, w * 0.8);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    radial.addColorStop(1, 'rgba(235, 227, 215, 0.35)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    // Subtle paper grain dots
    ctx.fillStyle = 'rgba(70, 58, 44, 0.025)';
    for (let i = 0; i < 200; i++) {
      const rx = (Math.sin(i * 997) * 0.5 + 0.5) * w;
      const ry = (Math.cos(i * 383) * 0.5 + 0.5) * h;
      ctx.fillRect(rx, ry, 1, 1);
    }
  }

  // 1. PAGE 0: FRONT COVER
  renderPage0() {
    const { canvas, ctx } = this.createCanvas();
    const w = this.width;
    const h = this.height;

    this.drawPaperBase(ctx);

    // Double hairline vintage border
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    ctx.strokeStyle = 'rgba(65, 55, 45, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Corner decorative ticks
    const inset = 14;
    const tickLen = 6;
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.5)';
    ctx.lineWidth = 1.2;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(inset, inset + tickLen); ctx.lineTo(inset, inset); ctx.lineTo(inset + tickLen, inset);
    // Top-Right
    ctx.moveTo(w - inset - tickLen, inset); ctx.lineTo(w - inset, inset); ctx.lineTo(w - inset, inset + tickLen);
    // Bottom-Left
    ctx.moveTo(inset, h - inset - tickLen); ctx.lineTo(inset, h - inset); ctx.lineTo(inset + tickLen, h - inset);
    // Bottom-Right
    ctx.moveTo(w - inset - tickLen, h - inset); ctx.lineTo(w - inset, h - inset); ctx.lineTo(w - inset, h - inset - tickLen);
    ctx.stroke();

    // Top Meta
    ctx.font = '500 8.5px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#7a7065';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('MOMENTS & MEMORIES', w / 2, 65);

    // Center Content
    ctx.font = 'italic 28px "Pinyon Script", "Great Vibes", cursive';
    ctx.fillStyle = '#4a4137';
    ctx.fillText('Wishing you', w / 2, 180);

    ctx.font = '500 24px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#24201c';
    ctx.fillText('A Beautiful Day', w / 2, 215);

    // Divider Line with Star
    ctx.strokeStyle = 'rgba(70, 60, 50, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 50, 238);
    ctx.lineTo(w / 2 - 12, 238);
    ctx.moveTo(w / 2 + 12, 238);
    ctx.lineTo(w / 2 + 50, 238);
    ctx.stroke();

    ctx.font = '10px serif';
    ctx.fillStyle = '#8a7d70';
    ctx.fillText('✦', w / 2, 241);

    ctx.font = '500 8px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#8a7d70';
    ctx.fillText('SPECIAL EDITION', w / 2, 260);

    // Bottom Hint
    ctx.font = '500 9px "Montserrat", sans-serif';
    ctx.fillStyle = '#6a5f54';
    ctx.fillText('TURN PAGE TO OPEN  →', w / 2, h - 45);

    return canvas.toDataURL('image/png');
  }

  // 2. PAGE 1: INSIDE LEFT
  renderPage1() {
    const { canvas, ctx } = this.createCanvas();
    const w = this.width;
    const h = this.height;

    this.drawPaperBase(ctx);

    // Hairline border
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.2)';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Framed Minimal Art Box
    const boxW = 180;
    const boxH = 180;
    const boxX = (w - boxW) / 2;
    const boxY = 60;

    // Matting box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.18)';
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Inner dashed matting
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.15)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(boxX + 12, boxY + 12, boxW - 24, boxH - 24);
    ctx.setLineDash([]);

    // Minimalist Compass / Geometric Emblem inside frame
    const cx = boxX + boxW / 2;
    const cy = boxY + boxH / 2;

    ctx.strokeStyle = '#9e9284';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#c4b8aa';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#786d61';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50);
    ctx.moveTo(cx - 50, cy); ctx.lineTo(cx + 50, cy);
    ctx.stroke();

    ctx.fillStyle = '#5c5246';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Sentiment text
    ctx.font = 'italic 13.5px "EB Garamond", Georgia, serif';
    ctx.fillStyle = '#423a31';
    ctx.textAlign = 'center';
    
    ctx.fillText('“The finest moments are those spent', w / 2, 290);
    ctx.fillText('in quiet reflection, gratitude, and the', w / 2, 312);
    ctx.fillText('warmth of true companionship.”', w / 2, 334);

    // Rule
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 25, 365);
    ctx.lineTo(w / 2 + 25, 365);
    ctx.stroke();

    // Crease fold shadow gradient on right edge (connecting to spine)
    const spineGrad = ctx.createLinearGradient(w - 24, 0, w, 0);
    spineGrad.addColorStop(0, 'rgba(30, 24, 18, 0)');
    spineGrad.addColorStop(1, 'rgba(30, 24, 18, 0.12)');
    ctx.fillStyle = spineGrad;
    ctx.fillRect(w - 24, 0, 24, h);

    return canvas.toDataURL('image/png');
  }

  // 3. PAGE 2: INSIDE RIGHT
  renderPage2() {
    const { canvas, ctx } = this.createCanvas();
    const w = this.width;
    const h = this.height;

    this.drawPaperBase(ctx);

    // Hairline border
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.2)';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Top memorandum line
    ctx.font = '500 8px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#7a7065';
    ctx.textAlign = 'left';
    ctx.fillText('MEMORANDUM', 34, 48);

    ctx.textAlign = 'right';
    ctx.fillText('VOL. I', w - 34, 48);

    ctx.strokeStyle = 'rgba(65, 55, 45, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(34, 56);
    ctx.lineTo(w - 34, 56);
    ctx.stroke();

    // Letter Salutation
    ctx.font = '500 18px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#24201c';
    ctx.textAlign = 'left';
    ctx.fillText('Dear Friend,', 34, 95);

    // Letter Paragraphs
    ctx.font = '14.5px "EB Garamond", Georgia, serif';
    ctx.fillStyle = '#302a24';

    // Paragraph 1
    ctx.fillText('As another chapter unfolds, I wanted to', 34, 135);
    ctx.fillText('send this simple note to remind you of how', 34, 157);
    ctx.fillText('deeply appreciated you are.', 34, 179);

    // Paragraph 2
    ctx.fillText('May the year ahead bring quiet peace,', 34, 215);
    ctx.fillText('inspiring journeys, and cherished milestones', 34, 237);
    ctx.fillText('shared with those who bring light to your world.', 34, 259);

    // Closing
    ctx.font = 'italic 13.5px "EB Garamond", Georgia, serif';
    ctx.fillStyle = '#544b41';
    ctx.fillText('With sincere warmth,', 34, 320);

    ctx.font = '28px "Pinyon Script", "Great Vibes", cursive';
    ctx.fillStyle = '#24201c';
    ctx.fillText('Always Yours', 34, 360);

    // Footer ornament
    ctx.font = '9px serif';
    ctx.fillStyle = '#8a7d70';
    ctx.textAlign = 'center';
    ctx.fillText('✦ ✦ ✦', w / 2, h - 36);

    // Crease fold shadow gradient on left edge (connecting to spine)
    const spineGrad = ctx.createLinearGradient(0, 0, 24, 0);
    spineGrad.addColorStop(0, 'rgba(30, 24, 18, 0.12)');
    spineGrad.addColorStop(1, 'rgba(30, 24, 18, 0)');
    ctx.fillStyle = spineGrad;
    ctx.fillRect(0, 0, 24, h);

    return canvas.toDataURL('image/png');
  }

  // 4. PAGE 3: BACK COVER
  renderPage3() {
    const { canvas, ctx } = this.createCanvas();
    const w = this.width;
    const h = this.height;

    this.drawPaperBase(ctx);

    // Double vintage border
    ctx.strokeStyle = 'rgba(65, 55, 45, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    ctx.strokeStyle = 'rgba(65, 55, 45, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Top Hallmark Mark
    ctx.textAlign = 'center';
    ctx.font = '16px serif';
    ctx.fillStyle = '#7a7065';
    ctx.fillText('✦', w / 2, 75);

    ctx.font = '500 9px "Cinzel", Georgia, serif';
    ctx.fillStyle = '#24201c';
    ctx.fillText('LETTERPRESS & CO.', w / 2, 95);

    ctx.font = '500 7px "Montserrat", sans-serif';
    ctx.fillStyle = '#8a7d70';
    ctx.fillText('FINE STATIONERY', w / 2, 108);

    // Middle quiet quote
    ctx.font = 'italic 14px "EB Garamond", Georgia, serif';
    ctx.fillStyle = '#4a4137';
    ctx.fillText('“Every story deserves to be kept close.”', w / 2, h / 2);

    // Minimal Barcode Graphic
    const barX = w / 2 - 40;
    const barY = h - 110;
    const bars = [2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2];
    ctx.fillStyle = '#3a3229';
    let curX = barX;
    bars.forEach((bWidth, idx) => {
      ctx.fillRect(curX, barY, bWidth, 24);
      curX += bWidth + (idx % 2 === 0 ? 2 : 3);
    });

    ctx.font = '500 7px "Montserrat", sans-serif';
    ctx.fillStyle = '#7a7065';
    ctx.fillText('N° 2026-CARD-REF', w / 2, h - 75);

    // Return to inside hint
    ctx.font = '500 8.5px "Montserrat", sans-serif';
    ctx.fillStyle = '#5a5045';
    ctx.fillText('← TURN PAGE TO READ INSIDE', w / 2, h - 45);

    return canvas.toDataURL('image/png');
  }

  // Render all 4 pages and return as image sources
  renderAll() {
    return [
      this.renderPage0(),
      this.renderPage1(),
      this.renderPage2(),
      this.renderPage3()
    ];
  }
}

window.CardPageRenderer = CardPageRenderer;

