import os
from PIL import Image, ImageDraw, ImageFont

output_dir = r"c:\Users\anily\Desktop\my org\Resume_Edit\frontend\public\images"
os.makedirs(output_dir, exist_ok=True)

def get_fonts():
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 22)
        font_header = ImageFont.truetype("arialbd.ttf", 17)
        font_body = ImageFont.truetype("arial.ttf", 13)
        font_bold = ImageFont.truetype("arialbd.ttf", 13)
        font_mono = ImageFont.truetype("consola.ttf", 12)
        font_small = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_title = font_header = font_body = font_bold = font_mono = font_small = ImageFont.load_default()
    return font_title, font_header, font_body, font_bold, font_mono, font_small

font_title, font_header, font_body, font_bold, font_mono, font_small = get_fonts()

def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def create_base_canvas(subtitle):
    W, H = 1200, 750
    img = Image.new("RGB", (W, H), color="#030712")
    draw = ImageDraw.Draw(img)
    
    # Background subtle grid lines
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill="#0b1329", width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill="#0b1329", width=1)
        
    # Top navbar container
    draw_rounded_rect(draw, (30, 20, W - 30, 75), radius=12, fill="#090f1d", outline="#1e293b", width=1)
    
    # NexCV Logo mark
    draw_rounded_rect(draw, (45, 32, 75, 62), radius=8, fill="#00c8ff")
    draw.text((54, 37), "N", fill="#030712", font=font_header)
    
    # NexCV Brand Name & Module Subtitle
    draw.text((85, 36), "NexCV", fill="#ffffff", font=font_title)
    draw.text((165, 40), "|", fill="#334155", font=font_header)
    draw.text((180, 40), subtitle, fill="#00c8ff", font=font_header)
    
    # nexzen.me Brand Badge
    draw_rounded_rect(draw, (W - 230, 34, W - 45, 62), radius=8, fill="#0f243a", outline="#00c8ff", width=1)
    draw.text((W - 215, 41), "nexzen.me · Verified", fill="#00c8ff", font=font_mono)
    
    return img, draw

# ---------------------------------------------------------
# SLIDE 1: FACT-GRAPH ENGINE
# ---------------------------------------------------------
def gen_slide_1():
    img, draw = create_base_canvas("Fact-Graph Architecture")
    W, H = 1200, 750
    
    # Main Glass Card
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "ATOMIC FACT-GRAPH DISCOVERY & GAP ROUTING", fill="#ffffff", font=font_header)
    draw.text((80, 160), "Converts raw resume text into atomic JSON nodes without hallucinating experience", fill="#94a3b8", font=font_body)
    
    # Node Card 1: Resume Facts
    draw_rounded_rect(draw, (80, 210, 400, 520), radius=12, fill="#0f172a", outline="#00c8ff", width=2)
    draw.text((100, 230), "Parsed Resume Facts", fill="#00c8ff", font=font_bold)
    facts = [
      "▪ React.js (4 Years Experience)",
      "▪ AWS EC2 & S3 Cloud Deployments",
      "▪ Docker Microservices Containerization",
      "▪ TypeScript & Node.js Backend API",
      "▪ PostgreSQL Database Architecture"
    ]
    y = 270
    for f in facts:
        draw.text((100, y), f, fill="#e2e8f0", font=font_body)
        y += 45

    # Center Connection Arrow
    draw_rounded_rect(draw, (440, 330, 560, 390), radius=10, fill="#0284c7")
    draw.text((455, 350), "Zero-Hallucination\n     Matching", fill="#ffffff", font=font_mono)

    # Node Card 2: Target JD Requirements
    draw_rounded_rect(draw, (600, 210, 920, 520), radius=12, fill="#0f172a", outline="#00e5a0", width=2)
    draw.text((620, 230), "Target Job Description (JD)", fill="#00e5a0", font=font_bold)
    jds = [
      "✓ React.js (Matched)",
      "✓ AWS & Docker (Matched)",
      "✓ PostgreSQL (Matched)",
      "⚠ GraphQL API (MISSING DETECTED)",
      "⚠ Kubernetes K8s (MISSING DETECTED)"
    ]
    y = 270
    for j in jds:
        col = "#00e5a0" if "✓" in j else "#ff4d6d"
        draw.text((620, y), j, fill=col, font=font_body)
        y += 45

    # Bottom Gap Routing Card
    draw_rounded_rect(draw, (940, 210, W - 80, 520), radius=12, fill="#180e29", outline="#a855f7", width=2)
    draw.text((955, 230), "Gap Engine Action", fill="#a855f7", font=font_bold)
    draw.text((955, 280), "Detected Skill Gaps:\n▪ GraphQL\n▪ Kubernetes", fill="#e2e8f0", font=font_body)
    
    draw_rounded_rect(draw, (955, 380, W - 95, 450), radius=8, fill="#a855f7")
    draw.text((965, 400), "ROUTED TO ADAPTIVE\nDIAGNOSTIC TEST", fill="#ffffff", font=font_bold)

    img.save(os.path.join(output_dir, "slide_1_fact_graph.png"))

# ---------------------------------------------------------
# SLIDE 2: ADAPTIVE DIAGNOSTIC TEST
# ---------------------------------------------------------
def gen_slide_2():
    img, draw = create_base_canvas("Adaptive Diagnostic Assessment")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "ADAPTIVE IRT SKILL EXAM & AUTOMATED GRADER", fill="#ffffff", font=font_header)
    
    # Progress Bar
    draw_rounded_rect(draw, (80, 170, W - 80, 185), radius=6, fill="#1e293b")
    draw_rounded_rect(draw, (80, 170, 720, 185), radius=6, fill="#00c8ff")
    draw.text((W - 240, 140), "Progress: Question 3 of 5", fill="#00c8ff", font=font_mono)

    # Question Box
    draw_rounded_rect(draw, (80, 210, W - 80, 480), radius=12, fill="#0f172a", outline="#334155", width=1)
    draw.text((100, 230), "Q3: Which Dockerfile instruction optimizes image layer caching and minimizes final container size?", fill="#ffffff", font=font_bold)
    
    # Code snippet box
    draw_rounded_rect(draw, (100, 270, W - 100, 340), radius=8, fill="#030712", outline="#1e293b", width=1)
    draw.text((120, 285), "# Example Dockerfile\nFROM golang:1.22-alpine AS builder\nCOPY . . RUN go build -o app .", fill="#94a3b8", font=font_mono)
    
    # Options
    draw_rounded_rect(draw, (100, 360, W - 100, 405), radius=8, fill="#0f2942", outline="#00c8ff", width=2)
    draw.text((120, 375), "✓ A) Use multi-stage builds (FROM scratch / alpine) and consolidate RUN layers", fill="#00c8ff", font=font_bold)
    
    draw_rounded_rect(draw, (100, 420, W - 100, 465), radius=8, fill="#1e293b")
    draw.text((120, 435), "B) Add EXPOSE 8080 at the start of Dockerfile", fill="#94a3b8", font=font_body)

    # Score Gauge Box
    draw_rounded_rect(draw, (80, 510, W - 80, 680), radius=12, fill="#0a221c", outline="#00e5a0", width=2)
    draw.text((110, 530), "INSTANT PERFORMANCE REPORT & SCORE GAUGE", fill="#00e5a0", font=font_bold)
    draw.text((110, 570), "OVERALL DIAGNOSTIC SCORE: 94% (PASS)", fill="#ffffff", font=font_title)
    draw.text((110, 615), "✓ Score exceeds 80% threshold · Unlocked official NexCV Verified Skill Proof Badge & HMAC token.", fill="#94a3b8", font=font_body)

    img.save(os.path.join(output_dir, "slide_2_adaptive_test.png"))

# ---------------------------------------------------------
# SLIDE 3: CRYPTOGRAPHIC SKILL BADGE
# ---------------------------------------------------------
def gen_slide_3():
    img, draw = create_base_canvas("Cryptographic Verified Proof Badge")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    
    # Certificate Badge Card
    draw_rounded_rect(draw, (150, 140, W - 150, H - 70), radius=20, fill="#0c172a", outline="#00e5a0", width=3)
    
    draw.text((200, 180), "OFFICIAL NexCV VERIFIED SKILL PROOF", fill="#00e5a0", font=font_title)
    draw.text((200, 220), "Candidate Name: Akhiransh Kumar", fill="#ffffff", font=font_header)
    draw.text((200, 255), "Verified Skill: Docker & Kubernetes Containerization", fill="#00c8ff", font=font_header)
    draw.text((200, 290), "Diagnostic Exam Score: 92% (Audited & Auto-Graded)", fill="#ffffff", font=font_bold)
    
    # Signature Hash Box
    draw_rounded_rect(draw, (200, 340, W - 200, 420), radius=10, fill="#030712", outline="#334155", width=1)
    draw.text((220, 355), "Cryptographic HMAC SHA-256 Token Signature Hash:", fill="#94a3b8", font=font_mono)
    draw.text((220, 380), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", fill="#00e5a0", font=font_mono)
    
    # Recruiter URL
    draw_rounded_rect(draw, (200, 450, W - 200, 520), radius=10, fill="#0f243a", outline="#00c8ff", width=1)
    draw.text((220, 472), "Public Recruiter Audit Link: https://nexcv.me/verify/v_8f9a2b3c4d5e", fill="#00c8ff", font=font_bold)

    # QR Code placeholder box
    draw_rounded_rect(draw, (W - 350, 180, W - 200, 310), radius=10, fill="#00e5a0")
    draw.text((W - 335, 235), "QR CODE\nAUDIT", fill="#030712", font=font_bold)

    img.save(os.path.join(output_dir, "slide_3_skill_badge.png"))

# ---------------------------------------------------------
# SLIDE 4: STAR INTERVIEW DEFENSE
# ---------------------------------------------------------
def gen_slide_4():
    img, draw = create_base_canvas("STAR Low-YOE Interview Defense Studio")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "RECRUITER PROBING QUESTION DEFENSE FOR 0-2 YOE CANDIDATES", fill="#ffffff", font=font_header)
    
    # Probing question card
    draw_rounded_rect(draw, (80, 170, W - 80, 240), radius=12, fill="#1c0f30", outline="#a855f7", width=2)
    draw.text((100, 185), "Recruiter Probing Question:", fill="#a855f7", font=font_mono)
    draw.text((100, 205), "&ldquo;You have 1 year of experience. How did you handle high-concurrency production API outages?&rdquo;", fill="#ffffff", font=font_bold)

    # 4 STAR Cards
    cards = [
      ("S - SITUATION", "High CPU spikes on AWS EC2 nodes during flash sale traffic burst.", "#0284c7"),
      ("T - TASK", "Maintain API endpoint availability and prevent database deadlocks.", "#00c8ff"),
      ("A - ACTION", "Configured Kubernetes HPA, Redis caching layer & CloudWatch alarms.", "#00e5a0"),
      ("R - RESULT", "Reduced MTTR by 65%, maintained 99.99% uptime with zero data loss.", "#a855f7")
    ]
    
    x = 80
    for title, desc, color in cards:
        draw_rounded_rect(draw, (x, 270, x + 245, 650), radius=12, fill="#0f172a", outline=color, width=2)
        draw.text((x + 15, 290), title, fill=color, font=font_bold)
        draw.text((x + 15, 340), desc, fill="#e2e8f0", font=font_body)
        x += 270

    img.save(os.path.join(output_dir, "slide_4_star_defense.png"))

# ---------------------------------------------------------
# SLIDE 5: ATS DUAL-SCAN SIMULATOR (MATCHING USER SCREENSHOT!)
# ---------------------------------------------------------
def gen_slide_5():
    # Title EXACT MATCH: NexCV | PARSEflow ATS Simulator
    img, draw = create_base_canvas("PARSEflow ATS Simulator")
    W, H = 1200, 750
    
    # Left Panel: RAW PARSED TEXT STREAM
    draw_rounded_rect(draw, (50, 100, 580, H - 40), radius=14, fill="#080e1a", outline="#00c8ff", width=2)
    draw.text((80, 120), "RAW PARSED TEXT STREAM", fill="#00c8ff", font=font_bold)
    
    lines = [
      ("1  [EMERALD] John Smith (Candidate Name)", "#00e5a0"),
      ("2  +1 555-0199 (Phone) · Bengaluru, India", "#00e5a0"),
      ("3  [RED] Formatting: Hidden Text/White Font", "#ff4d6d"),
      ("4  Experience: Senior Software Engineer (4 YOE)", "#e2e8f0"),
      ("5  [EMERALD] Masters Computer Science (Education)", "#00e5a0"),
      ("6  Skills: Java, Python, AWS, Docker, React", "#00e5a0"),
      ("7  [RED] Parse Risk: Non-Standard Resume Layout", "#ff4d6d"),
      ("8  Built reusable React components cutting load 40%", "#e2e8f0"),
      ("9  Deployed containerized services on AWS Docker", "#e2e8f0"),
      ("10 [RED] Parse Risk: Hidden Table Borders Detected", "#ff4d6d")
    ]
    y = 160
    for l_text, l_col in lines:
        draw.text((70, y), l_text, fill=l_col, font=font_mono)
        y += 45

    # Right Panel: PARSING ANALYTICS & DASHBOARD
    draw_rounded_rect(draw, (600, 100, W - 50, H - 40), radius=14, fill="#080e1a", outline="#334155", width=1)
    draw.text((630, 120), "PARSING ANALYTICS & DASHBOARD", fill="#ffffff", font=font_bold)
    
    # ATS Match Gauge Box
    draw_rounded_rect(draw, (630, 160, W - 80, 310), radius=12, fill="#0f172a", outline="#00c8ff", width=1)
    draw.text((650, 180), "ATS MATCH SCORE GAUGE", fill="#94a3b8", font=font_mono)
    draw.text((650, 215), "86%", fill="#00c8ff", font=ImageFont.truetype("arialbd.ttf", 36) if hasattr(ImageFont, "truetype") else font_title)
    draw.text((760, 230), "ATS MATCH SCORE: 86/100 (Excellent Match)", fill="#00e5a0", font=font_bold)

    # Keyword Density Heatmap Box
    draw_rounded_rect(draw, (630, 330, W - 80, 520), radius=12, fill="#0f172a", outline="#334155", width=1)
    draw.text((650, 350), "KEYWORD DENSITY HEATMAP (Emerald = High Density)", fill="#94a3b8", font=font_mono)
    
    # Heatmap Grid
    kw_grid = [
      [("Java (18)", "#00e5a0"), ("Python (15)", "#00e5a0"), ("AWS (12)", "#00c8ff")],
      [("React (10)", "#00c8ff"), ("Docker (8)", "#00c8ff"), ("GraphQL", "#ff4d6d")]
    ]
    gx_start, gy_start = 650, 390
    for r_idx, row in enumerate(kw_grid):
        for c_idx, (kw, col) in enumerate(row):
            gx = gx_start + (c_idx * 160)
            gy = gy_start + (r_idx * 55)
            draw_rounded_rect(draw, (gx, gy, gx + 145, gy + 45), radius=8, fill="#090f1d", outline=col, width=1)
            draw.text((gx + 15, gy + 15), kw, fill=col, font=font_bold)

    # Layout Readability Analysis Box
    draw_rounded_rect(draw, (630, 540, W - 80, 680), radius=12, fill="#0f172a", outline="#334155", width=1)
    draw.text((650, 555), "LAYOUT READABILITY ANALYSIS", fill="#ffffff", font=font_bold)
    draw.text((650, 595), "Scanability: 92%  |  Headers Detected: 7  |  Hierarchy: Consistent", fill="#e2e8f0", font=font_body)
    draw.text((650, 630), "Parse Speed: 1.2s  |  Risks Flagged: 3 Format Drop Alerts", fill="#94a3b8", font=font_body)

    img.save(os.path.join(output_dir, "slide_5_ats_dualscan.png"))

# ---------------------------------------------------------
# SLIDE 6: CAMPUS AMBASSADOR PORTAL
# ---------------------------------------------------------
def gen_slide_6():
    img, draw = create_base_canvas("Student Campus Ambassador Portal")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#a855f7", width=2)
    draw.text((80, 130), "NexCV UNIVERSITY STUDENT CAMPUS AMBASSADOR PORTAL", fill="#a855f7", font=font_header)
    
    # Status Card
    draw_rounded_rect(draw, (80, 180, 650, 360), radius=14, fill="#0f172a", outline="#00c8ff", width=2)
    draw.text((110, 210), "ACCOUNT STATUS & CREDENTIALS", fill="#00c8ff", font=font_bold)
    draw.text((110, 250), "✓ UNIVERSITY EMAIL VERIFIED: student@university.edu.in", fill="#00e5a0", font=font_header)
    draw.text((110, 295), "Status: Verified Campus Ambassador · Domain Granted", fill="#94a3b8", font=font_body)

    # Bonus Credits Card
    draw_rounded_rect(draw, (680, 180, W - 80, 360), radius=14, fill="#1c0f30", outline="#a855f7", width=2)
    draw.text((710, 210), "BONUS CREDENTIALS", fill="#a855f7", font=font_bold)
    draw.text((710, 250), "+10 FREE CREDITS UNLOCKED!", fill="#ffffff", font=font_title)
    draw.text((710, 295), "Instant grant upon university email registration.", fill="#94a3b8", font=font_body)

    # Leaderboard Box
    draw_rounded_rect(draw, (80, 390, W - 80, 680), radius=14, fill="#0f172a", outline="#334155", width=1)
    draw.text((110, 410), "STUDENT CAMPUS LEADERBOARD & REWARD TRACKER", fill="#ffffff", font=font_bold)
    
    students = [
      "1. Akhiransh K. (VIT University) — 14 Classmates Referred · 70 Credits Earned",
      "2. Rahul S. (IIT Madras) — 11 Classmates Referred · 55 Credits Earned",
      "3. Ananya M. (BITS Pilani) — 9 Classmates Referred · 45 Credits Earned"
    ]
    y = 460
    for st in students:
        draw.text((110, y), st, fill="#e2e8f0", font=font_body)
        y += 50

    img.save(os.path.join(output_dir, "slide_6_campus_edu.png"))

# ---------------------------------------------------------
# SLIDE 7: VIRAL REFERRAL LOOPS
# ---------------------------------------------------------
def gen_slide_7():
    img, draw = create_base_canvas("Reciprocal Viral Referral Engine")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "RECIPROCAL REFERRAL REWARD LOOP (+5 CREDITS EACH)", fill="#ffffff", font=font_header)

    # Code Box
    draw_rounded_rect(draw, (80, 180, 650, 340), radius=14, fill="#0f172a", outline="#00c8ff", width=2)
    draw.text((110, 210), "YOUR UNIQUE REFERRAL TOKEN", fill="#94a3b8", font=font_mono)
    draw.text((110, 245), "NEX-CAMPUS-2026", fill="#00c8ff", font=font_title)
    draw.text((110, 290), "Share this token with classmates & colleagues to earn free credits.", fill="#e2e8f0", font=font_body)

    # Tree Diagram Box
    draw_rounded_rect(draw, (680, 180, W - 80, 340), radius=14, fill="#0a221c", outline="#00e5a0", width=2)
    draw.text((710, 210), "DUAL REWARD STRUCTURE", fill="#00e5a0", font=font_bold)
    draw.text((710, 250), "You (Referrer): +5 Credits\nClassmate (Referee): +5 Credits", fill="#ffffff", font=font_header)

    # Activity Log
    draw_rounded_rect(draw, (80, 370, W - 80, 680), radius=14, fill="#0f172a", outline="#334155", width=1)
    draw.text((110, 395), "REFERRAL HISTORY & BALANCE LEDGER", fill="#ffffff", font=font_bold)
    logs = [
      "✓ Referral Code Applied by dev_rahul@email.com (+5 Credits Grant)",
      "✓ Referral Code Applied by priya_m@email.com (+5 Credits Grant)",
      "✓ Educational Domain Verification Bonus (+10 Credits Grant)"
    ]
    y = 445
    for lg in logs:
        draw.text((110, y), lg, fill="#00e5a0", font=font_body)
        y += 55

    img.save(os.path.join(output_dir, "slide_7_referral_loops.png"))

# ---------------------------------------------------------
# SLIDE 8: RECRUITER B2B PIPELINE
# ---------------------------------------------------------
def gen_slide_8():
    img, draw = create_base_canvas("B2B Recruiter Pre-Verified Pipeline")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "PRE-VERIFIED CANDIDATE TALENT MARKETPLACE FOR RECRUITERS", fill="#ffffff", font=font_header)

    # Search filter box
    draw_rounded_rect(draw, (80, 180, 360, 680), radius=14, fill="#0f172a", outline="#334155", width=1)
    draw.text((100, 205), "SEARCH FILTERS", fill="#00c8ff", font=font_bold)
    draw.text((100, 250), "✓ Verified Competency >= 90%\n✓ Docker & K8s Tested\n✓ React.js & TypeScript\n✓ Low-YOE Candidate Filter\n✓ HMAC Proof Audited", fill="#94a3b8", font=font_body)

    # Candidate Cards
    c_cards = [
      ("Akhiransh Kumar", "94% Docker Verified · VIT Univ.", "HMAC Token: v_8f9a2b", "#00c8ff"),
      ("Sarah Jenkins", "92% React & AWS Verified", "HMAC Token: v_7c3a9d", "#00e5a0"),
      ("Mark Lindqvist", "90% GraphQL & Node Verified", "HMAC Token: v_9e2b1f", "#a855f7")
    ]
    y = 180
    for name, skill, token, col in c_cards:
        draw_rounded_rect(draw, (380, y, W - 80, y + 140), radius=14, fill="#0f172a", outline=col, width=2)
        draw.text((410, y + 25), name, fill="#ffffff", font=font_title)
        draw.text((410, y + 65), skill, fill=col, font=font_bold)
        draw.text((410, y + 95), f"{token} · Audited on nexcv.me", fill="#94a3b8", font=font_mono)
        
        # Action button
        draw_rounded_rect(draw, (W - 250, y + 40, W - 100, y + 95), radius=8, fill=col)
        draw.text((W - 235, y + 57), "BOOK INTERVIEW", fill="#030712", font=font_bold)
        y += 165

    img.save(os.path.join(output_dir, "slide_8_recruiter_b2b.png"))

# ---------------------------------------------------------
# SLIDE 9: AI DOCX LAYOUT PRESERVATION ENGINE
# ---------------------------------------------------------
def gen_slide_9():
    img, draw = create_base_canvas("AI DOCX Layout Preservation Engine")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "WORD XML STRUCTURAL PRESERVATION & FORMAT SAFEGUARDS", fill="#ffffff", font=font_header)

    # XML Visual Box
    draw_rounded_rect(draw, (80, 180, W - 80, 480), radius=14, fill="#030712", outline="#00c8ff", width=2)
    draw.text((110, 205), "WORD DOCUMENT XML STRUCTURE TREE", fill="#00c8ff", font=font_mono)
    
    xml_code = [
      "<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>",
      "  <w:body>",
      "    <w:p w:rsidR='00A123'>",
      "      <w:r><w:t>Deployed containerized microservices on AWS using Docker.</w:t></w:r>",
      "    </w:p> <!-- Targeted Bullet Injection without breaking section margins -->",
      "  </w:body>",
      "</w:document>"
    ]
    y = 250
    for xc in xml_code:
        draw.text((110, y), xc, fill="#e2e8f0" if "<w:t>" in xc else "#64748b", font=font_mono)
        y += 32

    # Safeguards Box
    draw_rounded_rect(draw, (80, 510, W - 80, 680), radius=14, fill="#0f172a", outline="#00e5a0", width=2)
    draw.text((110, 530), "FORMAT PRESERVATION GUARANTEES", fill="#00e5a0", font=font_bold)
    draw.text((110, 570), "✓ Fonts, margins, line spacing & bullet indentations 100% preserved.", fill="#ffffff", font=font_body)
    draw.text((110, 615), "✓ No-op engine safeguards prevent duplicate bullet insertions or corrupted DOCX downloads.", fill="#94a3b8", font=font_body)

    img.save(os.path.join(output_dir, "slide_9_docx_engine.png"))

# ---------------------------------------------------------
# SLIDE 10: CRYPTOGRAPHIC SECURITY & PRIVACY AUDIT
# ---------------------------------------------------------
def gen_slide_10():
    img, draw = create_base_canvas("Enterprise Privacy & HMAC Security Audit")
    W, H = 1200, 750
    
    draw_rounded_rect(draw, (50, 100, W - 50, H - 40), radius=16, fill="#080e1a", outline="#1e293b", width=1)
    draw.text((80, 130), "ENTERPRISE PRIVACY STANDARDS & HMAC PAYLOAD VERIFICATION", fill="#ffffff", font=font_header)

    # Box 1: S3 Storage
    draw_rounded_rect(draw, (80, 180, 570, 420), radius=14, fill="#0f172a", outline="#00c8ff", width=2)
    draw.text((110, 210), "SUPABASE PRIVATE S3 BUCKET", fill="#00c8ff", font=font_bold)
    draw.text((110, 250), "✓ Row-Level Security (RLS) Active\n✓ Private bucket storage\n✓ Instant candidate data purge", fill="#e2e8f0", font=font_body)

    # Box 2: HMAC Validation
    draw_rounded_rect(draw, (610, 180, W - 80, 420), radius=14, fill="#0a221c", outline="#00e5a0", width=2)
    draw.text((640, 210), "HMAC SHA-256 VALIDATION", fill="#00e5a0", font=font_bold)
    draw.text((640, 250), "✓ Cryptographic signature valid\n✓ Public token minimization (No PII)\n✓ Anti-tamper verification link", fill="#e2e8f0", font=font_body)

    # Box 3: Audit Console
    draw_rounded_rect(draw, (80, 450, W - 80, 680), radius=14, fill="#030712", outline="#334155", width=1)
    draw.text((110, 475), "SECURITY AUDIT LOG CONSOLE", fill="#ffffff", font=font_mono)
    draw.text((110, 520), "[AUDIT] Candidate resume payload encrypted via AES-256 at rest.", fill="#94a3b8", font=font_mono)
    draw.text((110, 560), "[AUDIT] Public proof page v_8f9a2b requested — PII scrubbed successfully.", fill="#00e5a0", font=font_mono)
    draw.text((110, 600), "[AUDIT] HMAC signature match confirmed against system secret.", fill="#00c8ff", font=font_mono)

    img.save(os.path.join(output_dir, "slide_10_security_hmac.png"))

# Execute all 10 generators
print("Generating 10 NexCV branded images...")
gen_slide_1()
gen_slide_2()
gen_slide_3()
gen_slide_4()
gen_slide_5()
gen_slide_6()
gen_slide_7()
gen_slide_8()
gen_slide_9()
gen_slide_10()
print("All 10 images generated successfully with 100% NexCV branding!")
