from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder=".", static_folder=".")
app.secret_key = "smartresume_secret_key"


def get_db():
    conn = sqlite3.connect("resume.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db()
    cursor = conn.cursor()

    # USERS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # RESUMES TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            email TEXT,
            phone TEXT,
            location TEXT,
            objective TEXT,
            education TEXT,
            skills TEXT,
            experience TEXT,
            projects TEXT,
            certifications TEXT,
            languages TEXT
        )
    """)

    # CHECK EXISTING COLUMNS
    cursor.execute("PRAGMA table_info(resumes)")
    columns = [column["name"] for column in cursor.fetchall()]

    # ADD NEW COLUMNS IF THEY DO NOT EXIST

    if "user_id" not in columns:
        cursor.execute("""
            ALTER TABLE resumes
            ADD COLUMN user_id INTEGER
        """)

    if "linkedin" not in columns:
        cursor.execute("""
            ALTER TABLE resumes
            ADD COLUMN linkedin TEXT
        """)

    if "github" not in columns:
        cursor.execute("""
            ALTER TABLE resumes
            ADD COLUMN github TEXT
        """)

    if "internship" not in columns:
        cursor.execute("""
            ALTER TABLE resumes
            ADD COLUMN internship TEXT
        """)

    if "achievements" not in columns:
        cursor.execute("""
            ALTER TABLE resumes
            ADD COLUMN achievements TEXT
        """)

    conn.commit()
    conn.close()


# =========================
# LOGIN
# =========================

@app.route("/")
def login():
    return redirect(url_for("register"))


@app.route("/login")
def login_page():
    return render_template("pro.html")


@app.route("/login", methods=["POST"])
def login_user():

    email = request.form.get("email")
    password = request.form.get("password")

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if user and check_password_hash(
        user["password"],
        password
    ):

        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        session["user_email"] = user["email"]

        return redirect(url_for("home"))

    else:

        return """
        <script>
            alert("Invalid Email or Password!");
            window.location.href = "/login";
        </script>
        """


# =========================
# REGISTER
# =========================

@app.route("/register")
def register():
    return render_template("register.html")


@app.route("/register", methods=["POST"])
def register_user():

    name = request.form.get("name")
    email = request.form.get("email")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")

    if not name or not email or not password or not confirm_password:

        return """
        <script>
            alert("Please fill all fields!");
            window.location.href = "/register";
        </script>
        """

    if password != confirm_password:

        return """
        <script>
            alert("Passwords do not match!");
            window.location.href = "/register";
        </script>
        """

    conn = get_db()

    existing_user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:

        conn.close()

        return """
        <script>
            alert("Email already registered! Please login.");
            window.location.href = "/login";
        </script>
        """

    hashed_password = generate_password_hash(password)

    conn.execute("""
        INSERT INTO users
        (
            name,
            email,
            password
        )
        VALUES (?, ?, ?)
    """, (
        name,
        email,
        hashed_password
    ))

    conn.commit()
    conn.close()

    return """
    <script>
        alert("Account created successfully! Please login.");
        window.location.href = "/login";
    </script>
    """


# =========================
# HOME
# =========================

@app.route("/home")
def home():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    return render_template("home.html")


# =========================
# RESUME PAGE
# =========================

@app.route("/resume")
def resume():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    return render_template("resume.html")


# =========================
# ATS PAGE
# =========================

@app.route("/ats")
def ats():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    return render_template("ats.html")


# =========================
# PREVIEW PAGE
# =========================

@app.route("/preview")
def preview():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    return render_template("preview.html")


# =========================
# PROFILE
# =========================

@app.route("/profile")
def profile():

    if "user_id" not in session:
        return redirect(url_for("login_page"))

    conn = get_db()

    resume_data = conn.execute("""
        SELECT phone, location
        FROM resumes
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (
        session["user_id"],
    )).fetchone()

    conn.close()

    return render_template(
        "profile.html",
        resume_data=resume_data
    )


# =========================
# SAVE RESUME
# =========================

@app.route("/save_resume", methods=["POST"])
def save_resume():

    if "user_id" not in session:

        return {
            "message": "Please login first!"
        }, 401

    data = request.get_json()

    conn = get_db()

    conn.execute("""
        INSERT INTO resumes
        (
            user_id,
            name,
            email,
            phone,
            location,
            linkedin,
            github,
            objective,
            education,
            skills,
            projects,
            certifications,
            internship,
            achievements,
            languages
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        session["user_id"],

        data.get("name"),

        data.get("email"),

        data.get("phone"),

        data.get("location"),

        data.get("linkedin"),

        data.get("github"),

        data.get("objective"),

        data.get("education"),

        data.get("skills"),

        data.get("projects"),

        data.get("certifications"),

        data.get("internship"),

        data.get("achievements"),

        data.get("languages")

    ))

    conn.commit()
    conn.close()

    return {
        "message": "Resume saved successfully!"
    }


# =========================
# LOGOUT
# =========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login_page"))


# =========================
# RUN APPLICATION
# =========================

init_db()

if __name__ == "__main__":
    app.run(debug=True)
