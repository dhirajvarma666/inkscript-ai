const editor = document.getElementById('editor');
const ruledLines = document.getElementById('ruledLines');
const paperBtns = document.querySelectorAll('[data-paper]');
const inkBtns = document.querySelectorAll('[data-ink]');
const fontBtns = document.querySelectorAll('.font-btn');

let currentPaper = 'white';
let currentInk = '#111111';
let currentFont = "'Inter', sans-serif";

/* PAPER */

paperBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    paperBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentPaper = btn.dataset.paper;

    if(currentPaper === 'ruled'){
      ruledLines.style.display = 'block';
    }else{
      ruledLines.style.display = 'none';
    }

  });

});

/* INK */

inkBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    inkBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentInk = btn.dataset.ink;

    editor.style.color = currentInk;

  });

});

/* FONT */

fontBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    fontBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFont = btn.dataset.font;

    editor.style.fontFamily = currentFont;

  });

});

/* PREVIEW */

document.getElementById('previewBtn').addEventListener('click', () => {

  const preview = window.open('', '_blank');

  preview.document.write(`
    <html>
    <head>
      <title>Preview</title>

      <style>

        body{
          margin:0;
          background:#f8f1e4;
          font-family:${currentFont};
        }

        .page{
          width:900px;
          min-height:1200px;
          margin:40px auto;
          position:relative;
          background:#f8f1e4;
          padding:76px 72px;
          box-sizing:border-box;
          overflow:hidden;
        }

        .ruled{
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 41px,
              rgba(60,60,60,.32) 41px,
              rgba(60,60,60,.32) 42px
            );
          background-position-y:76px;
        }

        .content{
          position:relative;
          z-index:2;
          color:${currentInk};
          font-size:22px;
          line-height:42px;
          white-space:pre-wrap;
          word-break:break-word;
        }

      </style>

    </head>

    <body>

      <div class="page ${currentPaper === 'ruled' ? 'ruled' : ''}">
        <div class="content">${editor.value.replace(/\n/g,'<br>')}</div>
      </div>

    </body>
    </html>
  `);

});

/* DOWNLOAD PDF */

document.getElementById('downloadBtn').addEventListener('click', () => {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    unit:'pt',
    format:'a4'
  });

  const marginLeft = 60;
  const marginTop = 76;

  const lineHeight = 32;

  const pageWidth = 595;
  const pageHeight = 842;

  const usableWidth = 470;

  doc.setFillColor(248,241,228);
  doc.rect(0,0,pageWidth,pageHeight,'F');

  if(currentPaper === 'ruled'){

    for(let y = marginTop; y < pageHeight - 40; y += lineHeight){

      doc.setDrawColor(170,170,170);
      doc.setLineWidth(0.6);

      doc.line(40, y + 10, pageWidth - 40, y + 10);

    }

  }

  /* ✅ FIXED COLOR BUG (IMPORTANT) */
  function hexToRgb(hex) {
    const c = hex.replace('#','');
    return {
      r: parseInt(c.substring(0,2),16),
      g: parseInt(c.substring(2,4),16),
      b: parseInt(c.substring(4,6),16)
    };
  }

  const rgb = hexToRgb(currentInk);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);

  doc.setFont('helvetica','normal');
  doc.setFontSize(16);

  const splitText = doc.splitTextToSize(editor.value, usableWidth);

  let y = marginTop;

  splitText.forEach(line => {

    if(y > pageHeight - 60){

      doc.addPage();

      doc.setFillColor(248,241,228);
      doc.rect(0,0,pageWidth,pageHeight,'F');

      if(currentPaper === 'ruled'){

        for(let ry = marginTop; ry < pageHeight - 40; ry += lineHeight){

          doc.setDrawColor(170,170,170);
          doc.setLineWidth(0.6);

          doc.line(40, ry + 10, pageWidth - 40, ry + 10);

        }

      }

      y = marginTop;

    }

    doc.text(line, marginLeft, y);

    y += lineHeight;

  });

  doc.save('assignment.pdf');

});

/* PARTICLES */

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const particles = [];

for(let i=0;i<35;i++){

  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2+1,
    v:(Math.random()*0.4)+0.2,
    a:Math.random()*0.35+0.08
  });

}

function animateParticles(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p=>{

    p.y -= p.v;

    if(p.y < -10){
      p.y = canvas.height + 10;
      p.x = Math.random()*canvas.width;
    }

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(200,130,58,${p.a})`;
    ctx.fill();

  });

  requestAnimationFrame(animateParticles);

}

animateParticles();