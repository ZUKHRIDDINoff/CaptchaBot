const {Telegraf} = require('telegraf');
const { createCanvas } = require('canvas');
const crypto = require('crypto');
const math = require('mathjs');

const bot = new Telegraf('6965623131:AAFA4d8SOzFfQ2Ljbbh9wOLcV2EEu-mmD-g');
let a = null;
let b = null;
let c = null;

bot.start(async ctx => startMe(ctx.message))
async function startMe(ctx) {
    // console.log(ctx);
    // console.log(ctx.message.from.first_name);
    bot.telegram.sendMessage(1064915646, `NEW USER: ${ctx.chat.first_name}`);
    c = 3
    let arr = [];
    let arr2 = []
    // const randomVal = await getRandomValue()
    const mathExp = await generateMathExpression();
    a = eval(mathExp);
    const image = await setDefaultCanva(mathExp);
    const values = await generateOtherValues(mathExp);
    for(let el in values) {
        if(el == 3 || el == 6 || el == 9) {
            arr.push(arr2);
            arr2 = []
        }
            arr2.push({
                text: values[el],
                callback_data: `captchaVal<>${values[el]}` 
            })
    }
    b = await bot.telegram.sendPhoto(ctx.chat.id, { source: image }, { caption: `Пожалуйста, выберите правильный ответ.`, reply_markup: {
        inline_keyboard: arr
    } })
}
async function generateOtherValues(realAns) {
    let numArr = [];
    for(let i = 0; i < 10; i++) {
        const value = math.randomInt(1, 20);
        if(value == eval(realAns)) {
            i -= 1
        }
        else {
            if(numArr.includes(value)){
                i -= 1
            }
            else numArr.push(value);
        }
    }
    numArr[math.randomInt(1,9)] = eval(realAns);
    return numArr;
}

async function generateMathExpression() {
    const operators = ['+', '-',];
    const num1 = math.randomInt(1, 10);
    const num2 = math.randomInt(1, 10);
    const operator = operators[math.randomInt(0, operators.length)];
    if((eval(`${num1} ${operator} ${num2}`) < 0) || (num1 == num2)) {
        return generateMathExpression()
    }
    else return `${num1} ${operator} ${num2}`

  }
  
async function getRandomValue() {
    const captcha = Math.random().toString(36).slice(2, 8).toUpperCase();
    const hash = crypto.createHash('sha256').update(captcha).digest('hex');
    return { captcha, hash };
}

async function setDefaultCanva(text) {  
    // Create a new canvas with specified width and height
    const canvas = createCanvas(320, 80);
    const canva = canvas.getContext('2d');
    
    // Set the background color
    canva.fillStyle = 'white';
    canva.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set the text color and font
    canva.fillStyle = 'black';
    canva.font = 'bold 55px Arial';
    
    // Center the text on the canvas
    const textWidth = canva.measureText(text).width;
    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height / 2) +20;
  
    // Draw the text on the canvas
    canva.fillText(text, x, y);
    
    // Convert the canvas to a JPEG buffer
    const buffer = canvas.toBuffer('image/jpeg');

    return buffer;
}

// bot.on('text', async (ctx) => {
//     const text = ctx.message.text;
//     if(text == eval(a)) {
//         return ctx.reply("You succesfully completed captcha!")
//     } else {
//         return ctx.reply("You not completed captcha!")
//     }
// });
bot.on('callback_query', async ctx => {
    const callData = ctx.update.callback_query;
    console.log(24,callData);
    const captchaVal = callData.data.split('<>');
    if(captchaVal[0] == 'captchaVal' ) {
        if(+captchaVal[1] == a){
            await bot.telegram.deleteMessage(callData.from.id, b.message_id);
            ctx.reply('Вы успешно завершили')
            // bot.telegram.editMessageCaption(callData.from.id, b.message_id, undefined, "Please try again");
        } else {
            ctx.deleteMessage()
            ctx.reply("Неправильный ответ!")
            return startMe(callData.message)
            // c -= 1
            // if(c != 0) {
            //     bot.telegram.editMessageCaption(callData.from.id, b.message_id, undefined, `Пожалуйста, выберите результат. Попытки: ${c}`, {
            //         reply_markup: callData.message.reply_markup
            //     });    
            // } else if(c == 0){
            //     bot.telegram.deleteMessage(callData.from.id, b.message_id);
            //     ctx.reply('У вас закончились попытки')

            // }
        }
    }

})
bot.launch();
