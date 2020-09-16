const { Builder, By, Key } = require('selenium-webdriver');

let driver = null;
let webBrowser = null;
let webBrowserName = 'firefox'; // Podrzani browseri: chrome, ie, edge, firefox, safari

const findElementByXpath = (xpath, isEndOfLine = true) => {
    let docEval = "document.evaluate(`" + xpath + "`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue";
    if (isEndOfLine) docEval += ";";
    return docEval;
}

const setBrowserOptionsAndDriver = () => {
    try {
        if (webBrowserName !== 'chrome' && webBrowserName !== 'firefox' && webBrowserName !== 'ie' && webBrowserName !== 'safari' && webBrowserName !== 'edge') {
            throw new Error('Web browser not supported!');
        }

        // Browser paket
        webBrowser = require('selenium-webdriver/' + webBrowserName);

        // Dodatne opcije za browser
        const options = new webBrowser.Options();
        // ... neke opcije ...
        // ... .. . ...

        // Selenium driver
        if (webBrowserName === 'firefox') {
            driver = new Builder().forBrowser(webBrowserName).setFirefoxOptions(options).build();
        }
        else if (webBrowserName === 'chrome') {
            driver = new Builder().forBrowser(webBrowserName).setChromeOptions(options).build();
        }
        else if (webBrowserName === 'edge') {
            driver = new Builder().forBrowser(webBrowserName).setEdgeOptions(options).build();
        }
        else if (webBrowserName === 'ie') {
            driver = new Builder().forBrowser(webBrowserName).setIeOptions(options).build();
        }
        else {
            driver = new Builder().forBrowser(webBrowserName).setSafariOptions(options).build();
        }
    }
    catch (error) {
        throw error;
    }
}

const runTesting = async () => {
    try {
        // Inicijalizacija browsera i drivera
        setBrowserOptionsAndDriver();

        // Otvaranje stranice za testiranje
        await driver.get('https://www.olx.ba/');
        // Otvaranje prozora u maksimaloj velicini
        await driver.manage().window().maximize();

        /****************************************************************************/
        /**************************** POCETNA STRANICA *****************************/
        /**************************************************************************/

        // Dodavanje nove kategorije - kreiranje elementa gotove unordered liste sa lijeve strane stranice
        // PROBLEM: naziv svake novododane kategorije izlazi izvan "okvira" liste
        await driver.executeScript(
            "let i1 = document.createElement('i');"
            + "i1.className='icn icn-kompjuteri';"
            + "let i2 = document.createElement('i');"
            + "i2.className='icn icn-arrow';"
            + "let a = document.createElement('a');"
            + "a.className = 'menuitem';"
            + "a.setAttribute('href', '#');"
            + "a.appendChild(i1);"
            + "a.appendChild(document.createTextNode('Dodatna tehnološka kategorija'));"
            + "a.appendChild(i2);"
            + "let li = document.createElement('li');"
            + "li.appendChild(a);"
            + "let ul = " + findElementByXpath("//ul[@id='pocetna-meni-lijevo']")
            + "ul.appendChild(li);"
        );

        // Mijenjanje velicine naslova - uklanjanje specificne klase za <h1> elemente i dodavanje nove
        // PROBLEM: slova u naslovu se ispreplicu i isti postaje nerazumljiv
        await driver.executeScript(
            "let style = document.createElement('style');"
            + "document.head.appendChild(style);"
            + "style.sheet.insertRule('.testClass { font-size: 5vw }');" // ili sa jedinicama za velicinu: px, em (originalna je px)
            + "let title = document.getElementsByTagName('h1');"
            + "for(t of title) {"
            + "t.classList.remove('ch1');"
            + "t.classList.add('testClass');"
            + "}"
        );

        // Dodavanje novih tabova
        await driver.executeScript(
            // Prvi tab 
            // PROBLEM: tab se ne prikazuje ako mu je naziv previse dug
            "let a1 = document.createElement('a');"
            + "a1.setAttribute('href', '#');"
            + "a1.appendChild(document.createTextNode('Da li ste znali?'));"
            + "let li1 = document.createElement('li');"
            + "li1.appendChild(a1);"
            + "let ul1 = " + findElementByXpath("/html/body/div[1]/div/div/div/ul")
            + "ul1.appendChild(li1);"

            // Drugi tab
            // PROBLEM: tab se ne prikazuje ako je vec prethodno dodan jedan tab
            + "let a2 = document.createElement('a');"
            + "a2.setAttribute('href', '#');"
            + "a2.appendChild(document.createTextNode('Bonusi'));"
            + "let li2 = document.createElement('li');"
            + "li2.appendChild(a2);"
            + "let ul2 = " + findElementByXpath("/html/body/div[1]/div/div/div/ul")
            + "ul2.appendChild(li2);"
        );

        // Logovanje sa testnim profilom
        await driver.findElement(By.id('loginbtn')).click();
        await driver.findElement(By.id('username')).sendKeys('nekonekic9');
        await driver.actions().sendKeys(Key.chord(Key.TAB, 'nekonekic123')).perform();
        await driver.actions().sendKeys(Key.chord(Key.TAB, Key.SPACE)).perform();
        await driver.actions().sendKeys(Key.chord(Key.TAB, Key.SPACE)).perform();

        /****************************************************************************/
        /**************************** PROFILNA STRANICA ****************************/
        /**************************************************************************/

        // Odgadjanje sljedece akcije drivera za 5 sekundi - cekanje na loadanje DOM-a
        await driver.sleep(5000); // nije dobro rjesenje, treba preko implicitnog ili eksplicitnog wait-a

        // Mijenjanje username-a u menu traci
        // PROBLEM: desna ikonica se ne prikazuje za 17+ karaktera
        // PROBLEM: username se ne prikazuje za 19+ karaktera
        await driver.executeScript(
            "let i = document.querySelector('#u_h > i');"
            + "function getTextFromDOMElem(el) {"
            + "return el.textContent ? el.textContent : el.innerText;"
            + "}"
            + "function setTextForDOMElem(el, txt) {"
            + "el.textContent ? el.textContent = txt : el.innerText = txt;"
            + "}"
            + "txtObj = i.nextSibling;"
            + "setTextForDOMElem(txtObj, 'NekiVeomaDugUsername');"
        );

        // Postavljanje broja notifikacija settings ikonice na visecifreni broj
        // PROBLEM: Broj prelazi na susjedni element liste u meniju 
        await driver.executeScript(
            "let notifNum = document.getElementById('header_verifikacija');"
            + "notifNum.innerHTML = '20000';"
        );

        // Mijenjanje velicine button-a na pop-up screen-u za cookies (na dnu ekrana)
        await driver.executeScript(
            "let cookieButton = document.getElementsByClassName('cookie-close')[0];"
            + "cookieButton.style.fontSize ='40px';"
            //+ "cookieButton.click();"
        );

        // Mijenjanje velicine teksta na "Blog" button-u u gornjem desnom uglu
        // PROBLEM: poremeti se pozicija button-a
        await driver.executeScript(
            "let blogButton = document.getElementById('loginbtn');"
            + "blogButton.style.fontSize = '3vw';"
        );

        // Mijenjanje broja "OLX kredita" u meniju 
        await driver.executeScript(
            "let i = document.querySelector('ul.nav.profil > li:nth-child(4) i');"
            + "function getTextFromDOMElem(el) {"
            + "return el.textContent ? el.textContent : el.innerText;"
            + "}"
            + "function setTextForDOMElem(el, txt) {"
            + "el.textContent ? el.textContent = txt : el.innerText = txt;"
            + "}"
            + "txtObj = i.nextSibling;"
            + "setTextForDOMElem(txtObj, '123456');"
        );
        
        /****************************************************************************/
        /******************************* OLX KREDIT ********************************/
        /**************************************************************************/
        await driver.findElement(By.css('.lijevo > ul:nth-child(3) > li:nth-child(3) > a')).click();
        
        // Mijenjanje velicine fonta na lijevom button-u
        // PROBLEM: tekst na button-u se preklapa i nije u potpunosti prikazan 
        await driver.executeScript(
            "let rButton = document.querySelector('a.linkovi_desno:nth-child(2)');"
            + "rButton.style.fontSize = '40px';"
        );

        /****************************************************************************/
        /*********************** "DOPUNI OLX KREDIT" MODAL *************************/
        /**************************************************************************/
        await driver.findElement(By.css('a.linkovi_desno:nth-child(1)')).click();
        await driver.sleep(5000); // Odgadjanje sljedece akcije drivera za 5 sekundi - cekanje na loadanje DOM-a
        // Otvaranje posljednjeg taba iz modala
        await driver.findElement(By.css('#myTab > li:nth-child(5) > a')).click();
        
        // Brisanje treceg elementa iz forme
        await driver.executeScript(
            //findElementByXpath("//div[@id='sms']/div[position()=1]/div/img[position()=1]", false) + ".remove();"
            findElementByXpath("//form[@id='bulkopcije']/div[position()=3]", false) + ".remove();"
        );
        
        await driver.findElement(By.id('zatvoriprozor')).click();

        /****************************************************************************/
        /********************** POSTAVKE --> PROFILNA SLIKA ************************/
        /**************************************************************************/
        await driver.findElement(By.id('u_h')).click();
        await driver.actions().sendKeys(Key.chord(Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.ENTER)).perform();
        await driver.sleep(5000); // Odgadjanje sljedece akcije drivera za 5 sekundi - cekanje na loadanje DOM-a
        await driver.findElement(By.css(".lijevo > ul li:nth-child(8) a")).click();

        // Uploadovanje profilne slike i provjera da li je doslo do problema sa prikazivanjem iste
        // -- Uplodovanje vrlo male slike (sa velicinom ≈ minimalno dozvoljenoj velicini)
        await driver.findElement(By.xpath("//input[@id='uploads']")).sendKeys(__dirname + '\\src\\pictures\\profilePicture1.jpg');
        await driver.findElement(By.xpath("//input[@id='uploadavatara']")).click();
        
        await driver.findElement(By.id('u_h')).click();
        await driver.actions().sendKeys(Key.chord(Key.TAB, Key.ENTER)).perform();
        await driver.sleep(5000);
        await driver.findElement(By.id('u_h')).click();
        await driver.actions().sendKeys(Key.chord(Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.TAB, Key.ENTER)).perform();
        await driver.sleep(5000);
        await driver.findElement(By.css(".lijevo > ul li:nth-child(8) a")).click();

        // -- Uploadovanje velike slike
        await driver.findElement(By.xpath("//input[@id='uploads']")).sendKeys(__dirname + '\\src\\pictures\\profilePicture2.jpg');
        await driver.findElement(By.xpath("//input[@id='uploadavatara']")).click();
        
        //driver.quit();
    }
    catch (error) {
        console.log(error);
    }
}

// Pokretanje testova
runTesting();