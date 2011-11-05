int periodLen = 5;
int cpmLen = 10;
int [] inputArr = new int [20];
PFont f1;
int arrX= 82, arrDx =30, arrY  = 300, arrDy = 10;

long  totalCpm = 0;
int cpm;
int tCount;

void setup()
{
    size(800, 400);
    background(0);
    f1 =  loadFont("Courier");
}

void draw()
{
    fill(0, 10);
    noStroke();
    rect(0, 0, width, height);
    updateCpm();
    drawArr();
    drawBkg();

    textFont(f1, 100);
    fill(255);
    textAlign(CENTER);
    text(cpm, 400, 200);
    textFont(f1, 40);
    text("CPM", 500, 200);
    text("ODO "+ totalCpm, 400, 300);

    //speed blur
}
void updateCpm()
{
    if (frameCount% periodLen ==0 )
    {
        for (int i=1; i<inputArr.length; i++)
            inputArr[i-1] = inputArr[i];
        inputArr[inputArr.length-1] = tCount;
    }

    if (frameCount% cpmLen ==0 )
    {
        tCount = 0;
    }
}


void drawBkg()
{
    fill(0, 100);
    stroke(0, 200, 255);
    strokeWeight(20);
    ellipse(400, 200, 350, 350);
    strokeWeight(10);
    ellipse(200, 300, 150, 150);
    ellipse(600, 300, 150, 150);

    stroke(0, 50, 150);
    strokeWeight(10);
    ellipse(400, 200, 350, 350);
    strokeWeight(5);
    ellipse(200, 300, 150, 150);
    ellipse(600, 300, 150, 150);
}

void drawArr()
{


    strokeWeight(5);
    stroke(0, 0, 100);
    for (int i=1; i<inputArr.length; i++)
        line(arrX + arrDx*i, arrY - arrDy*inputArr[i-1], 
                arrX + arrDx*(i+1), arrY - arrDy*inputArr[i]
            );
    stroke(255);
    for (int i=0; i<inputArr.length; i++)
        point(arrX + arrDx*(i+1), arrY-arrDy*inputArr[i]);
}

void gsPoke() {
    tCount++;
}

void gsDigest(float curcpm, float curodo, float mood)
{
    cpm = (int) (curcpm);
    totalCpm = (int) curodo;
    int cur_mood = (int)mood;
    textFont(f1,40);
    textAlign(LEFT);
    switch(mood)
    {
        case 0: text("GET BACK TO WORK",100,100); break;
        case 1: text("WORK WORK!",100,200); break;
        case 2: text("0W3NAGE",600,200); break;
    }


}

/*

void keyPressed()
{
    gs_keyPressed()
}

*/

