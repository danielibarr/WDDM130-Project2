const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const uploadPath = path.join(__dirname, "uploads");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure EJS
app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadPath));

// Home Route
app.get("/", (req, res) => {
    res.render("home");
});

// About Route
app.get("/about", (req, res) => {
    res.render("about");
});

// Request Form Route
app.get("/request", (req, res) => {

    res.render("request", {

        errors: [],
        requestData: {}

    });

});

// Handle Service Request Submission
app.post("/request", (req, res) => {


    const requestData = req.body;
    const errors = validateRequest(requestData);
    
    if (!req.files || !req.files.studentCard) {

        errors.push("Student Card Image is required");

    }

    else {

        const allowedTypes = [
         "image/jpeg",
            "image/png"
        ];


        if (!allowedTypes.includes(req.files.studentCard.mimetype)) {

            errors.push(
                "Student Card Image must be a JPG or PNG file"
            );

        }

    }

    if (errors.length > 0) {


        return res.render("request", {

            errors,
            requestData

        });


    }

    const studentCard = req.files.studentCard;
    const fileName = Date.now() + "-" + studentCard.name;
    const filePath = path.join(uploadPath, fileName);

    studentCard.mv(filePath);


    const processed = {

        requestNumber:
            "REQ-" + Math.floor(Math.random() * 100000),

        responseTime:
            getResponseTime(requestData.serviceType, requestData.urgency),

        status:
            getStatus(requestData.serviceType),

        uploadedImage:
            fileName,

        date:
            new Date().toLocaleString()

    };


    res.render("result", {
        requestData,
        processed
    });


});

function getResponseTime(service, urgency) {


    if (urgency === "High") {

        return "Within 24 hours";

    }


    if (service === "Academic Support") {

        return "Same day or next business day";

    }


    if (service === "Enrollment Letter") {

        return "2-3 business days";

    }


    if (service === "ID Card Replacement") {

        return "1-3 business days";

    }


    return "3-5 business days";

}



function getStatus(service) {


    if (service === "ID Card Replacement") {

        return "Processing fee: $25";

    }


    if (service === "Enrollment Letter") {

        return "Processing fee: $10";

    }


    if (service === "Academic Support") {

        return "No fee required";

    }


    return "Request received";

}

function validateRequest(data) {


    let errors = [];


    // Required fields

    if (!data.fullName) {

        errors.push("Student name is required");

    }


    if (!data.studentId) {

        errors.push("Student ID is required");

    }


    if (!data.email) {

        errors.push("Email is required");

    }


    if (!data.program) {

        errors.push("Program name is required");

    }


    if (!data.serviceType) {

        errors.push("Please select a service type");

    }


    // Student ID format XXX-XXX-XXXX

    const idPattern = /^\d{3}-\d{3}-\d{4}$/;


    if (data.studentId && !idPattern.test(data.studentId)) {

        errors.push(
            "Student ID must follow the format XXX-XXX-XXXX"
        );

    }


    // Email validation

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (data.email && !emailPattern.test(data.email)) {

        errors.push(
            "Please enter a valid email address"
        );

    }


    return errors;

}

// Start Server
if (require.main === module) {

    app.listen(PORT, () => {

        console.log(`Server running on port ${PORT}`);

    });

}


module.exports = app;