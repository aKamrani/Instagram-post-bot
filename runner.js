const { exec } = require("child_process");
const puppeteer = require("puppeteer");
const iPhone = puppeteer.devices["iPhone 6"];
const driver_path_windows = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const driver_path_linux = '/usr/bin/chromium-browser';
const driver_path_mac = '/usr/bin/chromium-browser';
var driver_path = '';

// linux & mac: sudo apt install chromium-browser
// windows: download & install it from official chrome website!


function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function type(page, selector, value, min, max, isXpath = false) {
  let element = []
  if (isXpath) {
    element = await page.$x(selector);
  } else {
    element[0] = await page.$(selector);
  }
  for (var i = 0; i < value.length; i++) {
    // if(normal_reg.test(value.charAt(i))){
      rand_delay = rand(min, max);
      await element[0].type(value.charAt(i), {delay: rand_delay});
    // } else {
      // element[0] += value.charAt(i);
    // }
  }
}

function detectOs() {
  const opsys = process.platform;
  var path = '';
  if (opsys == "darwin") {
      path = driver_path_mac;
  } else if (opsys == "win32" || opsys == "win64") {
      path = driver_path_windows;
  } else if (opsys == "linux") {
      path = driver_path_linux;
  }
  return path
}


exports.run = async (path, caption, username, password, fit) => {

    driver_path = detectOs();

    const browser = await puppeteer.launch({
        executablePath: driver_path,
        headless: false,
        slowMo: 300,
        // args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    // prepare settings for go to instagram
    page .setDefaultTimeout(5000);
    await page.emulate(iPhone);
    await page.goto("https://instagram.com/accounts/login/");

  try {
    // todo:try-catch
    // Accept Cookies => Accept All
    try {
      await page.waitForXPath('//button[contains(.,"Accept All")]');
      const [saveInfo] = await page.$x('//button[contains(.,"Accept All")]');
      await saveInfo.click({delay: rand(20, 30)});
    } catch (e) {
      // todo: take-image
      await page.screenshot({ path: './COOCKIES.png' });
      console.log('COOCKIES ', e.message);
    }

    // todo:try-catch
    // please wait few minutes => Log in
    try {
      await page.waitForXPath('//a[contains(.,"Log in")]');
      await page.waitForTimeout(3 * 60 * 60);
      const [waitFewMinutes] = await page.$x('//a[contains(.,"Log in")]');
      await waitFewMinutes.click({delay: rand(20, 30)});
    } catch (e) {
      // todo: take-image
      await page.screenshot({ path: './WAIT-FEW-MINUTES.png' });
      console.log('WAIT-FEW-MINUTES ', e.message);
    }

    // username
    await page.waitForSelector("input[name=username]");
    await page.waitForTimeout(rand(150, 300));
    await type(page, "input[name=username]", username, 1, 6);
    // password
    await page.waitForTimeout(rand(150, 300));
    await type(page, "input[name=password]", password, 3, 8);
    // submit
    await page.waitForTimeout(rand(150, 300));
    const signIn = await page.$("button[type=submit]");
    await Promise.all([
      page.waitForTimeout(rand(4000, 7000)),
      signIn.click({delay: rand(20, 30)})
    ])

    // todo:try-catch
    // save-info => not now
    try {
      await page.waitForXPath('//*[@id="react-root"]/section/main/div/div/div/button');
      const [saveInfo] = await page.$x('//*[@id="react-root"]/section/main/div/div/div/button');
      await saveInfo.click({delay: rand(20, 30)});
    } catch (e) {
      // todo: take-image
      await page.screenshot({ path: './SAVE-INFO.png' });
      console.log('SAVE-INFO ', e.message);
    }

    // todo:try-catch
    // add-to-homescreen => cancel
    try {
      await page.waitForTimeout(rand(7100, 10000));
      const [addToHomeScreen] = await page.$x('//button[contains(.,"Cancel")]');
      await addToHomeScreen.click({delay: rand(20, 30)});
    } catch (e) {
      // todo: take-image
      await page.screenshot({ path: './ADD-TO-HOME-SCREEN.png' });
      console.log('ADD-TO-HOME-SCREEN ', e.message);
    }

      // click add button (its a div not button)
      await page.waitForTimeout(rand(300, 500));
      const add_btn = await page.evaluate(() => {
        const addBtn = document.evaluate(
            '//*[@id="react-root"]/section/nav[2]/div/div/div[2]/div/div/div[3]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          )
          .singleNodeValue.getBoundingClientRect();
        return {
          x: addBtn.x + addBtn.width / 2,
          y: addBtn.y + addBtn.height / 2
        }
      });
      
      // upload image
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.mouse.click(x = add_btn.x, y = add_btn.y, {
          delay: 3
        }),
      ]);
      await fileChooser.accept([path]);

      // click to fit picture
      if(fit){
        try {
          await page.waitForXPath('//span[text()="Expand"]');
          const [fitBtn] = await page.$x('//span[text()="Expand"]');
          await fitBtn.click({delay: rand(20, 30)});
        } catch (e) {
          // todo: take-image
          await page.screenshot({ path: './FIT.png' });
          console.log('FIT ', e.message);
        }
      }

      // click next button to add caption
      await page.waitForTimeout(rand(600, 1000));
      const [nextBtnCaption] = await page.$x('//*[@id="react-root"]/section/div[1]/header/div/div[2]/button');
      await nextBtnCaption.click({delay: rand(20, 30)});

      // type cation
      await page.waitForXPath('//*[@id="react-root"]/section/div[2]/section[1]/div[1]/textarea');
      await page.waitForTimeout(rand(100, 600));
      await type(
        page,
        '//*[@id="react-root"]/section/div[2]/section[1]/div[1]/textarea',
        caption,
        1,
        5,
        true
      );

      // click share button
      await page.waitForTimeout(rand(600, 1000));
      const [shareBtn] = await page.$x('//*[@id="react-root"]/section/div[1]/header/div/div[2]/button');
      await shareBtn.click({delay: rand(20, 30)});

      // todo:try-catch
      // turn-on-notifications => turn-on
      try {
        await page.waitForXPath('/html/body/div[5]/div/div/div/div[3]/button[1]');
        const [turnOnNotifs] = await page.$x('/html/body/div[5]/div/div/div/div[3]/button[1]');
        await turnOnNotifs.click({delay: rand(20, 30)});
      } catch (e) {
        // todo: take-image
        await page.screenshot({ path: './NOTIFS.png' });
        console.log('NOTIFS ', e.message);
      }

    await browser.close();
  } 
  catch(e) {
    // todo: take-image
    await page.screenshot({ path: './FINAL.png' });
    console.log('FINAL ', e.message);
    await browser.close();
  }
};
