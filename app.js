var exec = require('child_process').exec;
const clipboardy = require('clipboardy');
const {Builder, By, Key, until} = require('selenium-webdriver');
var fs = require('fs');

const game_rounds="4";
const game_round_time="120";
const player_name="bob the bot";
const set_player_name = true;

var time_out_speed_of_bot = 800;

const max_wait = 1000 * 60 * 10; //2mins
const filePath = "./word_list.txt";
const findScriptPath = "./scripts/find";
var word_list;
var text_length;
var myturn = false;
var words = [];
var get_new_words = true;
var my_name;
var written_words = 0;
var written_words_temp = 0;
var ok_to_write = true;
var invite_link = "";

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        //console.log('received data: ' + data);
        word_list = data;
    } else {
        console.log(err);
    }
});

function execute_non(script) {
    exec(script, function (err, stdout, stderr) {
        words = stdout.split("\n");
        console.log(words);
    });
}

function bot_hide() {
    let max = 1000;
    let min = 600;
    if(written_words > 2){
        max = 1500;
        min = 1100;
    }
    time_out_speed_of_bot = Math.floor(Math.random() * (max - min + 1) + min);
}

function selectByVisibleText(select, textDesired) {
    select.findElements(By.tagName('option'))
        .then(options => {
            options.map(option => {
                option.getText().then(text => {
                    //console.log("option-text=",text);
                    if (text == textDesired)
                        option.click();
                });
            });
        });
}

function checkwin(element) {
    element.findElements(By.tagName('p')).then(ps => {
            //console.log("\n\n\nabout to p text");
            written_words_temp = 0;
            ps.reverse().map(p => {
                p.getText().then(text => {
                    //console.log("pstext=",text);
                    if (text.includes("guessed the word!")) {
                        if(text.includes(my_name)){
                            if(written_words >0 && written_words_temp < 3) {
                                console.log("#########################won#############################");
                                ok_to_write = false;
                            }

                        }

                    }
                    written_words_temp++;
                });
            });
        });
}



async function setup(driver) {
    try {
        await driver.get('https://skribbl.io');
        //await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);

        if(set_player_name) {
            await driver.wait(until.elementIsVisible(driver.findElement(By.id('inputName'))), max_wait).then(element => {
                element.sendKeys(player_name);
            });
        }

        //click on create custom lobby
        await driver.findElement(By.id('buttonLoginCreatePrivate')).click();

        //wait until page is loaded
        await driver.wait(until.elementIsVisible(driver.findElement(By.className('title'))), max_wait).then(element => {
            console.log("waiting until settings are visable");
        });

        //change rounds
        await driver.findElement(By.id('lobbySetRounds'), max_wait).then(element => {
            console.log("selecting lobby");
            selectByVisibleText(element, game_rounds);
        });

        //change draw time
        await driver.findElement(By.id('lobbySetDrawTime'), max_wait).then(element => {
            console.log("selecting lobby");
            selectByVisibleText(element, game_round_time);
        });

        //write to textarea
        await driver.findElement(By.id('lobbySetCustomWords'), max_wait).then(element => {
            console.log("writing to textarea");
            element.sendKeys(word_list);
            //selectByVisibleText(element, "120");
        });

        //tick use words exclusively
        await driver.findElement(By.id('lobbyCustomWordsExclusive'), max_wait).then(element => {
            console.log("ticking check box");

                element.click();

        });

        //wait until player joins
        // await driver.wait(until.elementIsVisible(driver.findElement(By.id('player1')))).then(element => {
        //     console.log("player joined");
        // });

        //id of button inviteCopyButton
        await driver.findElement(By.id('inviteCopyButton')).click().then(nothing =>{
            clipboardy.read().then(text =>{
                invite_link = text;
                console.log("got invite link: ", invite_link);
            });
        });




        await driver.wait(until.elementLocated(By.id('player1')), max_wait).then(el => {
            console.log("player joined");
        });

    } finally {
        //await driver.quit();
    }
}

const wait_for_text = driver =>
    new Promise(resolve =>
        setTimeout(() => resolve(driver.wait(until.elementLocated(By.id('currentWord')), max_wait).getText().then(text => {
            if(text.length !== 0){
                console.log("current word is ",text, " lenght is ",text.length);
                text_length = text.length;
                myturn = !text.includes("_");
                return "ok";
            }
            //resolve("no");
            return "no";
        })), time_out_speed_of_bot))


const try_input = driver =>
    new Promise(resolve =>
        setTimeout(() => resolve(driver.findElement(By.id('inputChat'), 20000).then(element => {
            //console.log("about to write word");
            if(get_new_words){
                get_new_words = false;
                console.log("getting new words");
                execute_non(findScriptPath + " " + text_length);
            }else{
                let word = words.shift();
                if(word != undefined && ok_to_write){
                    console.log("writing word ", word);
                    written_words++;
                    element.sendKeys(word, Key.RETURN);
                }

            }


            //selectByVisibleText(element, "120");
        }))), time_out_speed_of_bot)



const get_text_loop = async driver => {
    let result = null
    while (result != 'ok') {
        //console.log(value)
        result = await wait_for_text(driver);
        //console.log(result);
    }
    console.log('got text length');
}


const game_loop = async driver => {
    let result = null
    console.log("starting game loop");
    while (result != 'ok') {
        //this gets the length of text that is being guessed
        await get_text_loop(driver);

        //get my name
        await driver.findElements(By.className('name')).then(divs => {
            divs.map(div => {
                div.getText().then(text => {
                    //console.log("pstext=",text);
                    if (text.includes("(You)")) {
                        my_name = text.split("(You)")[0];
                        console.log("found my name:",my_name);
                    }
                });
            });
        });

        //runs when guessing
        if(!myturn){
            //randomise delay
            bot_hide();

            //type guess
            console.log("random wait is ", time_out_speed_of_bot);
            await try_input(driver);
            //check if you won also
            await driver.findElement(By.id('boxMessages'), 20000).then(element => {
                //console.log("selecting lobby");
                checkwin(element);
            });

            //check if its our turn to pick a word
            //id of container is wordContainer. need to get the first div and click on it
            await driver.wait(until.elementIsVisible(driver.findElement(By.className('wordContainer'))), 1000).then(element => {
                console.log("picking the first word");
                element.findElements(By.className('word'))
                    .then(divs => {
                        divs[0].click();
                    });
            }).catch(function (err) {
                //console.log("wordContainer is not here yet");
            });


        }else{

            //pick a word once
            //id of container is wordContainer. need to get the first div and click on it
            get_new_words = true;
            written_words = 0;
            words = [];
            ok_to_write = true;

        }
        //console.log(result);
    }
    console.log('got text length');
}

async function play_game(driver){
    //wait for round to start
    await driver.wait(until.elementLocated(By.id('round')), max_wait).then(el => {
        console.log("round started");
    });
    //main loop
    await game_loop(driver);
}

async function runner() {
    let driver = await new Builder().forBrowser('firefox').build();
    await setup(driver);
    await play_game(driver);
}

runner();


