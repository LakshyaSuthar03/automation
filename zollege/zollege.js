const puppeteer = require("puppeteer");
const fs = require("fs");

// Promise-based delay
function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Slow type function
async function slowType(page, selector, value = "") {
  value = String(value ?? "");

  for (let char of value) {
    await page.type(selector, char);
    await delay(1);
  }
}

// Reliable star rating clicker
async function clickStarRating(page, nameAttr, count) {
  const stars = await page.$$(`button[name="${nameAttr}"]`);

  if (!stars.length) {
    console.log("No stars found for:", nameAttr);
    return;
  }

  const index = count - 1;
  if (!stars[index]) {
    console.log(`Star index ${index} not found for ${nameAttr}`);
    return;
  }

  for (let i = 0; i <= index; i++) {
    const box = await stars[i].boundingBox();
    if (!box) continue;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await delay(150);
  }

  await stars[index].click();
  await delay(300);
}

// Read review data
const reviews = JSON.parse(fs.readFileSync("/home/lakshya/work/automation/zollege/reviews.json", "utf8"));

(async () => {
  for (let i = 0; i < reviews.length; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 1,
      defaultViewport: null,
    });

    const data = reviews[i];
    const page = await browser.newPage();

    console.log(`\nStarting review submission ${i + 1} of ${reviews.length}`);

    try {
      await page.goto(`https://zollege.in/write-review?referral_code=${data.referralcode}`, {
        waitUntil: "networkidle2",
      });

      await delay(800);

      // --------------------------
      // PERSONAL DETAILS
      // --------------------------
      await slowType(page, '[name="name"]', data.name);
      await slowType(page, '[name="mobile"]', data.mobile);
      await slowType(page, '[name="email"]', data.email);

      await page.click(`#${data.gender}`);
      await delay(200);

      // --------------------------
      // COLLEGE / COURSE FIELDS
      // --------------------------
      await slowType(page, "#college_name", data.collegename);
      await delay(1000);
      await page.keyboard.press("Enter");

      await slowType(page, "#course_name", data.coursename);
      await delay(1000);
      await page.keyboard.press("Enter");

      await slowType(page, "#enrollment_year", data.enrollmentyear);
      await page.keyboard.press("Enter");

      await slowType(page, "#quota_select", data.quotaselect);
      await page.keyboard.press("Enter");

      await slowType(page, "#qualification_12th_board", data.qualification12thboard);
      await page.keyboard.press("Enter");

      await slowType(page, '[name="qualification_12th_percent"]', data.qualification12thpercent);
      await slowType(page, '[name="qualification_grad_degree_percent"]', data.qualificationgraddegreepercent);

      await slowType(page, "#course_slug1", data.courseslug1);
      await page.keyboard.press("Enter");

      await slowType(page, '[name="class_size"]', data.classsize);

      // --------------------------
      // FEES / SCHOLARSHIP
      // --------------------------
      await slowType(page, '[name="program_fee"]', data.programfee);
      await slowType(page, '[name="scholarship_review"]', data.scholarshipreview);
      await slowType(page, '[name="did_opt"]', data.didopt);

      // --------------------------
      // COURSE REVIEW
      // --------------------------
      await slowType(page, '[name="course_info"]', data.courseinfo);

      // --------------------------
      // CAMPUS
      // --------------------------
      await slowType(page, '[name="campus"]', data.campus);

      // --------------------------
      // HOSTEL
      // --------------------------
      await slowType(page, '[name="hostel_review"]', data.hostelreview);
      await slowType(page, '[name="hostel_fee"]', data.hostelfee);

      // --------------------------
      // PLACEMENT & INTERNSHIP
      // --------------------------
      await slowType(page, '[name="campus_placement"]', data.campusplacement);
      await slowType(page, '[name="internship"]', data.internship);
      await slowType(page, '[name="average_placement"]', data.averageplacement);

      await slowType(page, '[name="review_title"]', data.reviewtitle);

      // --------------------------
      // LIKES / DISLIKES
      // --------------------------
      await slowType(page, '[name="likes_field[0].pos_sentences"]', data.likesfield0possentences);
      await slowType(page, '[name="likes_field[1].pos_sentences"]', data.likesfield1possentences);
      await slowType(page, '[name="dislikes_field[0].neg_sentences"]', data.dislikesfield0negsentences);
      await slowType(page, '[name="dislikes_field[1].neg_sentences"]', data.dislikesfield1negsentences);

      // --------------------------
      // PAYMENT / SOCIAL
      // --------------------------
      await slowType(page, '[name="payment_content"]', data.paymentcontent);
      await slowType(page, '[name="linkedin_profile"]', data.linkedinprofile);
      await slowType(page, '[name="referral_code"]', data.referralcode);
      await slowType(page, '[name="upload_doc_type"]', data.referralcode);

      await clickStarRating(page, "scholarship_rating", Number(data.scholarshiprating));
      await clickStarRating(page, "college_rating", Number(data.collegerating));
      await clickStarRating(page, "course_rating", Number(data.courserating));
      await clickStarRating(page, "campus_rating", Number(data.campusrating));
      await clickStarRating(page, "hostel_rating", Number(data.hostelrating));
      await clickStarRating(page, "placement_rating", Number(data.placementrating));
      await clickStarRating(page, "internship_rating", Number(data.internshiprating));

      await delay(3000);

      // SUBMIT (uncomment when fully tested)
      // await page.click('button[type="submit"]');
      // await page.waitForNavigation({ waitUntil: "networkidle2" });

      console.log(`Review ${i + 1} completed\n`);
    } catch (error) {
      console.error(`Error in review ${i + 1}:`, error.message);
    }

    // await page.close();
    // await browser.close();
    // await delay(3000); // gap between submissions
  }

  console.log("All reviews processed");

})();
