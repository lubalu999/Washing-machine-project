function rangeSlider(value) {
    document.getElementById('rangeValue').innerHTML = value;
}

function main() {
    stand.setFromStand();
    console.log(stand.getFromStand());

    stand.printState();
    stand.printToHTML();
}
function stop() {
    stand.reset();
}

function exPLIS() {
    stand.setToStand(document.getElementById('toStand').value);
}

var arrayImages = ['nolampa.png', 'lampa.png'];

class Stand {
    constructor() {
        this.toStand = ("0".repeat(13)); // От стенда к модели
        this.fromStand = ("0".repeat(24)); // От модели на стенд 
        this.start = false; // Машина не работает
        this.finish = false;   
        this.temperature_done = false; // Флаг нагрева температуры
        this.volume_done = false; // Флаг объёма температуры                                          
        
        this.userTemperature = 0;
        this.timeLeft = 0;
        this.realTemperature = 24;
        this.realVolume = 0;
        this.error = "0";
    }

    reset(){
        this.toStand = ("0".repeat(13));                           
        this.fromStand = ("0".repeat(24));                          
        this.start = false;                                                 
        this.finish = false;   
        this.temperature_done = false;                                     
        this.volume_done = false;                                                                                  
        
        this.userTemperature = 0;
        this.timeLeft = 0;
        this.realTemperature = 24;
        this.realVolume = 0;
        this.error = "0";
    }

    printToHTML() {
        document.getElementById("water_level").innerHTML = parseInt(this.realVolume);
        document.getElementById("water_temp").innerHTML = parseInt(this.realTemperature);
        document.getElementById("time_left").innerHTML = parseInt(this.timeLeft);

        document.getElementById('levelWaterImg').src = arrayImages[parseInt(this.toStand[0])];
        document.getElementById('tempWaterImg').src = arrayImages[parseInt(this.toStand[2])];
        document.getElementById('draining').src = arrayImages[parseInt(this.toStand[1])];
        document.getElementById('workDoneImg').src = arrayImages[parseInt(this.toStand[4])];

        document.getElementById("toStandPrint").innerHTML = this.toStand;
        document.getElementById("fromStandPrint").innerHTML = this.getFromStand();
    }

    intToBits(number, radix) { // Метод принимает число и возвращет строку 010101
        let value = (number).toString(2);
        return "0".repeat(radix - value.length) + value;
    }

    getChoosenTemperature() {
        var temperature = document.getElementById('userTemperature').value;
        this.userTemperature = temperature;
        temperature -= 30;
        return this.intToBits(temperature, 6);
    }

    getUserStart() {
        return document.getElementById('userStart').checked ? '1' : '0';
    }

    getUserStop() {
        return document.getElementById('userStop').checked ? '1' : '0';
    }

    getUserTime() {
        return document.querySelector('input[name="userTime"]:checked').value;
    }

    setToStand(toStand) { // Управляющие сигналы от плис
        this.toStand = toStand;
    }

    setFromStand() {
        this.fromStand = this.getFromStand();
    }

    getFromStand() {
        return this.getUserStart() + this.getUserStop() + this.isStateError() + this.getUserTime() 
        + this.getChoosenTemperature() + this.intToBits(parseInt(this.realVolume), 6) + this.intToBits(parseInt(this.realTemperature), 7);
    }

    isStateError() {
        return this.error;
    }

    printState() {
        console.log("Старт работы: ", this.getUserStart());
        console.log("Сброс: ", this.getUserStop());
        console.log("Машина неисправна: ", this.isStateError());
        console.log("Регулятор времени: ", this.getUserTime());
        let temp = this.getChoosenTemperature();
        console.log("Регулятор температуры: ", temp, " ", parseInt(temp, 2) + 30);
        console.log("Уровень воды: ", this.intToBits(parseInt(this.realVolume), 6), " ", parseInt(this.realVolume));
        console.log("Температура воды: ", this.intToBits(parseInt(this.realTemperature), 7), " ", parseInt(this.realTemperature));
    }

    updateToStand(index, value) {
        var newToStand = this.toStand.split('');
        newToStand[index] = value;
        this.toStand = newToStand.join('');
    }

    doWork() {
        this.setFromStand();
        console.log(this.fromStand, " ", this.toStand);
        if (this.error == "0") 
        {            
            if (this.toStand[0] == "1") { // [Набор воды, 1]    
                if (this.realVolume >= 50) {
                    this.error = "1";
                    return;
                }
                else {
                    this.realVolume += 0.1;  
                }

                if (this.realVolume >= 42)
                    this.volume_done = true;
            } else
            if (this.toStand[1] == "1") { // [Слив воды, 1]
                if (this.realVolume > 0) 
                    this.realVolume -= 0.1; 
                else 
                    this.realVolume = 0;

                if (this.realVolume <= 0) 
                    this.realVolume = 0; 

                if (this.realVolume < 42)
                    this.volume_done = false;
            } else
            if (this.toStand[2] == "1") { // [Нагрев, 1] 
                if (this.realVolume == 0 || this.realTemperature >= 93) // Если объём воды = 0 или нельзя увеличить темпераруту воды
                    this.error = "1";            
                else 
                    this.realTemperature += 0.1;
                
                if (this.realTemperature >= (parseInt(this.getChoosenTemperature(), 2) + 30))
                    this.temperature_done = true;
            } else
            if (this.toStand[3] == "1" && this.temperature_done == true && this.volume_done == true) { // [Работа двигателя, 1]
                let img = document.getElementById('container'); // Выводить вращение машинки
                angle = (angle + 90) % 360;
                img.className = "rotate" + angle;
            } else
            if (this.toStand[4] == "1") { // [Индикатор завершения работы, 1]
                //вывод индикатора-лампочки
            } 
            this.timeLeft = parseInt(this.toStand.slice(5,13), 2); // Оставшееся время
            stand.printToHTML();
        }
    }
}

var angle = 0;
let stand = new Stand();
let timerId = setInterval(() => stand.doWork(), 100);// повторить с интервалом 0.1 секунду