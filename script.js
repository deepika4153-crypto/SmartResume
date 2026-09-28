function getResumeData() {

    return {
        name: document.getElementById("name")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",
        location: document.getElementById("location")?.value.trim() || "",
        linkedin: document.getElementById("linkedin")?.value.trim() || "",
        github: document.getElementById("github")?.value.trim() || "",
        objective: document.getElementById("objective")?.value.trim() || "",
        education: document.getElementById("education")?.value.trim() || "",
        skills: document.getElementById("skills")?.value.trim() || "",
        projects: document.getElementById("projects")?.value.trim() || "",
        certifications: document.getElementById("certifications")?.value.trim() || "",
        internship: document.getElementById("internship")?.value.trim() || "",
        achievements: document.getElementById("achievements")?.value.trim() || "",
        languages: document.getElementById("languages")?.value.trim() || ""
    };
}


function generateResume() {

    const data = getResumeData();

    if (!data.name) {
        alert("Please enter your Full Name!");
        return;
    }

    if (!data.email) {
        alert("Please enter your Email!");
        return;
    }

    if (!data.phone) {
        alert("Please enter your Phone Number!");
        return;
    }

    if (!data.objective) {
        alert("Please enter your Career Objective!");
        return;
    }

    if (!data.education) {
        alert("Please enter your Education!");
        return;
    }

    if (!data.skills) {
        alert("Please enter your Technical Skills!");
        return;
    }

    if (!data.projects) {
        alert("Please enter your Project!");
        return;
    }

    localStorage.setItem(
        "resumeData",
        JSON.stringify(data)
    );

    window.location.href = "/preview";
}


function clearForm() {

    const fields = [
        "name",
        "email",
        "phone",
        "location",
        "linkedin",
        "github",
        "objective",
        "education",
        "skills",
        "projects",
        "certifications",
        "internship",
        "achievements",
        "languages"
    ];

    fields.forEach(function(field) {

        const element =
            document.getElementById(field);

        if (element) {
            element.value = "";
        }

    });

    localStorage.removeItem("resumeData");
}


function saveResume() {

    const data = getResumeData();

    if (!data.name || !data.email) {

        alert("Please enter Name and Email!");

        return;
    }

    fetch("/save_resume", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())

    .then(result => {

        alert(result.message);

    })

    .catch(error => {

        console.error(error);

        alert("Error saving resume!");

    });
}


function loadPreview() {

    const savedData =
        localStorage.getItem("resumeData");

    if (!savedData) {
        return;
    }

    const data =
        JSON.parse(savedData);


    const name =
        document.getElementById("previewName");

    const contact =
        document.getElementById("previewContact");

    const social =
        document.getElementById("previewSocial");

    const objective =
        document.getElementById("previewObjective");

    const education =
        document.getElementById("previewEducation");

    const skills =
        document.getElementById("previewSkills");

    const projects =
        document.getElementById("previewProjects");

    const certifications =
        document.getElementById("previewCertifications");

    const internship =
        document.getElementById("previewInternship");

    const achievements =
        document.getElementById("previewAchievements");

    const languages =
        document.getElementById("previewLanguages");


    if (name) {
        name.textContent =
            data.name || "Your Name";
    }


    if (contact) {

        contact.textContent =
            [
                data.email,
                data.phone,
                data.location
            ]
            .filter(Boolean)
            .join(" | ");

    }


    if (social) {

        social.innerHTML = "";

        if (data.linkedin) {

            const linkedin =
                document.createElement("span");

            linkedin.textContent =
                "LinkedIn: " + data.linkedin;

            social.appendChild(linkedin);
        }

        if (data.linkedin && data.github) {

            social.appendChild(
                document.createTextNode(" | ")
            );

        }

        if (data.github) {

            const github =
                document.createElement("span");

            github.textContent =
                "GitHub: " + data.github;

            social.appendChild(github);
        }
    }


    if (objective) {

        objective.textContent =
            data.objective ||
            "No career objective provided.";

    }


    if (education) {

        education.innerHTML = "";

        const lines =
            data.education
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        lines.forEach(function(line, index) {

            const div =
                document.createElement("div");

            div.className =
                "education-line";

            if (index === 0) {
                div.classList.add("education-main");
            }

            div.textContent = line;

            education.appendChild(div);

        });
    }


    if (skills) {

        skills.innerHTML = "";

        const lines =
            data.skills
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        lines.forEach(function(line) {

            const div =
                document.createElement("div");

            div.className =
                "skill-line";

            if (line.includes(":")) {

                const parts =
                    line.split(":");

                const category =
                    document.createElement("span");

                category.className =
                    "skill-category";

                category.textContent =
                    parts[0] + ":";

                div.appendChild(category);

                div.appendChild(
                    document.createTextNode(
                        " " +
                        parts.slice(1).join(":").trim()
                    )
                );

            } else {

                div.textContent = line;

            }

            skills.appendChild(div);

        });
    }


    if (projects) {

        projects.innerHTML = "";

        const lines =
            data.projects
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        if (lines.length > 0) {

            const title =
                document.createElement("div");

            title.className =
                "project-title";

            title.textContent =
                lines[0];

            projects.appendChild(title);

            if (lines.length > 1) {

                const ul =
                    document.createElement("ul");

                ul.className =
                    "project-list";

                lines.slice(1).forEach(function(line) {

                    const li =
                        document.createElement("li");

                    li.textContent = line;

                    ul.appendChild(li);

                });

                projects.appendChild(ul);
            }
        }
    }


    loadList(
        certifications,
        data.certifications
    );

    loadTextSection(
        internship,
        data.internship
    );

    loadList(
        achievements,
        data.achievements
    );

    loadList(
        languages,
        data.languages
    );
}


function loadList(element, text) {

    if (!element) {
        return;
    }

    element.innerHTML = "";

    const lines =
        text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    lines.forEach(function(line) {

        const li =
            document.createElement("li");

        li.textContent = line;

        element.appendChild(li);

    });
}


function loadTextSection(element, text) {

    if (!element) {
        return;
    }

    element.innerHTML = "";

    const lines =
        text
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    lines.forEach(function(line) {

        const div =
            document.createElement("div");

        div.className =
            "internship-line";

        div.textContent = line;

        element.appendChild(div);

    });
}


document.addEventListener(
    "DOMContentLoaded",
    function() {
        loadPreview();
    }
);