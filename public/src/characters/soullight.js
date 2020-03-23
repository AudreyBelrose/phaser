class SoulLight extends Phaser.Physics.Matter.Sprite{
    constructor(config,owner) {
        super(config.scene.matter.world, config.x, config.y, config.sprite, config.frame)
        this.scene = config.scene;
        // Create the physics-based sprite that we will move around and animate
        //this.sprite = this.scene.matter.add.sprite(config.x, config.y, config.sprite, config.frame);
        config.scene.matter.world.add(this);
        // config.scene.sys.displayList.add(this);
        // config.scene.sys.updateList.add(this);
        config.scene.add.existing(this); // This adds to the two listings of update and display.

        this.setActive(true);

        this.sprite = this;

        const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
        const { width: w, height: h } = this.sprite;
        const mainBody = Bodies.circle(0,0,w*.20, { isSensor: true });

        const compoundBody = Body.create({
            parts: [mainBody],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 0.1,
            label: "SOULLIGHT"
          });
          this.sprite
            .setExistingBody(compoundBody)
            .setPosition(config.x, config.y)
            .setIgnoreGravity(true);

        this.owner = owner.sprite;

        this.ownerid = 0;
        

        this.debug = this.scene.add.text(this.x, this.y-16, 'SoulLight', { fontSize: '10px', fill: '#00FF00' });              
        this.passing = false;  
        this.threshhold_distance = 64;  
        this.move_speed = 50;
        this.base_speed = 1;
        this.max_speed = 50;//25 
        this.accel = 1;
        this.projectile_speed = 14;//12
        this.sprite.setFriction(.3,.3);
        this.sprite.setIgnoreGravity(true);
        this.protection_radius = {value:200, max: 200, original: 250};//How much does the light protect;
        this.throw = {x:0,y:0};
        this.readyThrow = false;

        this.aimer = this.scene.add.image(this.x,this.y,'soullightblast').setScale(.5).setOrigin(0.5);
        this.aimer.setVisible(false);
        this.aimer.ready = true;
        this.aimer.started = false;
        this.aimerRadius = 52;
        this.aimerCircle = new Phaser.Geom.Circle(this.x, this.y, this.aimerRadius);
        
        this.isBeaming = false;//If it is beaming, it can will carry Bright with it.
        this.passChain = [];//Soulight pass to each of these entities in order.
        this.passChainIndex = 0;

        // this.aimLine = this.scene.add.line(200,200,25,0,50,0,0xff66ff)
        // this.aimLine.setLineWidth(4,4);

        this.setVisible(false);//Until the init Soulcrystal is collected, it is not visible.
        
        //Create Soulight Effect
        //This should be inactive until the player retrieves the soulight gem for the first time.
        this.scene.particle_soulight = this.scene.add.particles('shapes',  this.scene.cache.json.get('effect-flame-fall'));   
        //this.particle_soulight.emitters.list[0].setScale(0.5);
        this.scene.particle_soulight.emitters.list[0].setLifespan(160);
        this.scene.particle_soulight.setActive(false);

    }

    update(time,delta)
    {    
        //Handle position and light growth and shrinking
        if(!this.passing){
            if(this.isBeaming){
                this.owner.setPosition(this.x,this.y);
                if(this.passChainIndex  < this.passChain.length){
                    let pcTarget = this.passChain[this.passChainIndex];
                    this.homeLight(pcTarget);
                    this.setVelocity(this.throw.x*this.move_speed,this.throw.y*this.move_speed);
                    if(Phaser.Math.Distance.Between(this.x,this.y,pcTarget.x,pcTarget.y) < 32){
                        //Just move onto it. Should speed up the transfer
                        this.setPosition(pcTarget.x,pcTarget.y);
                    }
                    if(this.x == pcTarget.x && this.y == pcTarget.y){
                        
                        this.move_speed = this.max_speed;
                        this.passChainIndex++;
                        this.setVelocity(0,0);
                    }
                }else{
                    this.clearChain();
                }

            }else{
                this.setPosition(this.owner.x,this.owner.y);            
            }
        }else{
            //Home in on target
            let target = this.ownerid == 0 ? bright : solana;
            this.homeLight(target);
            this.setVelocity(this.throw.x*this.move_speed,this.throw.y*this.move_speed);
        }
        
        if(this.readyThrow){
            if(this.protection_radius.value >  (this.protection_radius.max/10)){
                this.protection_radius.value-=(this.protection_radius.max/10);
            }else{
                //Ready to launch
                this.passLight();
            };
        }else{
            if(this.protection_radius.value <  this.protection_radius.max){this.protection_radius.value+=25;};
        }
        if(this.aimer.started){
            //Update Aimer
            this.setAimer();
        }
        //Max Velocities
        if(this.body.velocity.x > this.max_speed){this.setVelocityX(this.max_speed)};
        if(this.body.velocity.x < -this.max_speed){this.setVelocityX(-this.max_speed)};
        if(this.body.velocity.y > this.max_speed){this.setVelocityY(this.max_speed)};
        if(this.body.velocity.y < -this.max_speed){this.setVelocityY(-this.max_speed)};
    }
    
    setAimer(){ 

        let gameScale = camera_main.zoom;
        let targVector = this.scene.getMouseVectorByCamera(this.ownerid);        
        
        if(this.owner.ctrlDeviceId >= 0){
            let gpVectors = this.scene.getGamepadVectors(this.owner.ctrlDeviceId,this.aimerRadius,this.x,this.y)
            let selectStick = gpVectors[1].x == this.x && gpVectors[1].y == this.y ? 0 : 1; // L / R , If right stick is not being used, us left stick.
            targVector = gpVectors[selectStick];
        }
        this.aimerCircle.x = this.x;
        this.aimerCircle.y = this.y;

        let angle = Phaser.Math.Angle.Between(this.x,this.y, targVector.x,targVector.y);
        let normAngle = Phaser.Math.Angle.Normalize(angle);
        let deg = Phaser.Math.RadToDeg(normAngle);

        let point = Phaser.Geom.Circle.CircumferencePoint(this.aimerCircle, normAngle);

        this.aimer.setPosition(point.x,point.y);

        this.aimer.rotation = normAngle;

        // this.aimLine.setPosition(this.x,this.y);
        // this.aimLine.setRotation(normAngle);
    }
    aimStart(){
        if(this.aimer.ready){
            this.aimer.started = true;
            this.aimer.setVisible(true);
        }
    }
    aimStop(){
        this.aimer.setVisible(false);
        if(this.aimer.ready && this.aimer.started){
            this.aimer.ready = false;
            this.aimer.started = false;
            let transfer = new SoulTransfer(this.scene,this.x,this.y,'soullightblast',0,this);
            transfer.rotation = this.aimer.rotation;
            transfer.fire(transfer.rotation,this.projectile_speed);
        }
    }
    homeLight(target){        
        let angle = Phaser.Math.Angle.Between(this.x,this.y,target.x,target.y);
        let targetDistance = Phaser.Math.Distance.Between(this.x,this.y,target.x,target.y);
        if(targetDistance <= this.move_speed){this.move_speed = targetDistance};
        this.throw.x = Math.cos(angle);
        this.throw.y = Math.sin(angle);  
    }
    passLight(){
        if(!this.passing){
            this.passing = true;
            //Get owner to set X/Y target
            let target = this.ownerid == 0 ? bright : solana;
            this.homeLight(target);
            //Reset Basic Movement Speed
            this.move_speed = this.max_speed;
        }

    }
    readyPass(){
        this.readyThrow = true;
    }
    readyAimer(){
        this.aimer.ready = true;
    }
    lockLight(target,id){
        if(id != this.ownerid && this.passing){
            this.readyThrow = false;
            this.passing = false;
            this.ownerid = id;
            this.owner = target;
            if(id == 0){
                bright.toDark();
            }else if(id == 1){
                bright.toBright();
            }    
        }    
    }
    addChain(Obj){
        if(this.passChain.includes(Obj) == false){        
            this.passChain.push(Obj);
            //Check first if an object is already in the chain. If so,
            //dont allow the push.      
        }
    }
    startChain(x,y){
        if(this.isBeaming == false){
            //console.log("Start Chain", this.passChain);
            if(this.passChain.length > 0){this.passChain.push({x:x,y:y});} //Last position in chain. Only add if there is alreadya  starting point
            this.isBeaming = true;
            this.passChainIndex = 0;
        }
    }
    clearChain(){
        //Do the beam move and teleport, then clear the chain
        this.isBeaming = false;
        this.passChain = [];
    }
    claim(){
        this.scene.particle_soulight.setActive(true);
        this.setVisible(true);
    }

}
//Soul Transfer is the "Bullet" that will hit before the Soulight can transfer.
class SoulTransfer extends Phaser.Physics.Matter.Sprite{
    constructor(scene, x, y, sprite, frame, parent) {
        super(scene.matter.world, x, y, sprite, frame)
        this.setScale(.10);
        this.scene = scene;
        scene.matter.world.add(this);
        scene.add.existing(this); 

        this.setActive(true);
        const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
        const { width: w, height: h } = this;
        const mainBody = Bodies.circle(0,0,w*.10, {isSensor:false});

        const compoundBody = Body.create({
            parts: [mainBody],
            frictionStatic: 0,
            frictionAir: 0.00,
            friction: 0.0,
            restitution: 0.7,
            label: "SOULTRANSFER"
          });
          this
            .setExistingBody(compoundBody)
            .setPosition(x, y)
            .setIgnoreGravity(true)
            .setCollisionCategory(CATEGORY.BULLET)
            .setCollidesWith([ CATEGORY.GROUND, CATEGORY.SOLID, CATEGORY.ENEMY, CATEGORY.BRIGHT, CATEGORY.SOLANA, CATEGORY.DARK, CATEGORY.MIRROR ]);
          //Custom properties
        this.parent = parent;
        this.timer = this.scene.time.addEvent({ delay: 2000, callback: this.kill, callbackScope: this, loop: false });
        this.alive = true;

        this.soundfling = game.sound.add('wavingtorch',{volume: 0.04});
        this.soundfling.addMarker({name:'soul-fling',start:.25,duration:.5});        
        this.soundfling.addMarker({name:'soul-burn-impact',start:1,duration:.2});
    }
    chain(angle,speed,obj){
        this.fire(angle,speed);
        this.parent.addChain(obj);
    }
    fire(angle,speed){        
        this.setVelocity(Math.cos(angle)*speed,Math.sin(angle)*speed);
        this.setRotation(angle);
        this.soundfling.play('soul-fling');
        //Dont allow it to HIT themselves.
        if(this.parent.ownerid == 0){
            this.setCollidesWith([ CATEGORY.GROUND, CATEGORY.SOLID, CATEGORY.ENEMY, CATEGORY.BRIGHT, CATEGORY.DARK, CATEGORY.MIRROR ]);
        }else{
            this.setCollidesWith([ CATEGORY.GROUND, CATEGORY.SOLID, CATEGORY.ENEMY, CATEGORY.SOLANA, CATEGORY.DARK, CATEGORY.MIRROR ]);
        }
    }
    hit(id){
        //Make sure this is space by moving one h/w radius away at the opposite angle
        let safetyBoundsVec = {x:Math.cos(this.rotation+Math.PI)*(this.parent.width/2),y:Math.sin(this.rotation+Math.PI)*(this.parent.height/2)};
        this.parent.startChain(this.x+safetyBoundsVec.x,this.y+safetyBoundsVec.y);
        //Hit other target, so trigger the launch of the soulight.
        if(this.parent.ownerid != id){
            this.parent.readyPass();
            this.timer = this.scene.time.addEvent({ delay: 100, callback: this.kill, callbackScope: this, loop: false });
        }

    }
    burn(){
        //Make sure this is space by moving one 32 radius away at the opposite angle
        let safetyBoundsVec = {x:Math.cos(this.rotation+Math.PI)*32,y:Math.sin(this.rotation+Math.PI)*32};
        this.parent.startChain(this.x+safetyBoundsVec.x,this.y+safetyBoundsVec.y);
        this.soundfling.play('soul-burn-impact');
        this.timer = this.scene.time.addEvent({ delay: 100, callback: this.kill, callbackScope: this, loop: false });
        //DO effect
        let burst = light_bursts.get(this.x,this.y);
        burst.burst(this.x,this.y);
        
        //Need to make it inactive here.
        this.setVelocity(0,0);
        this.setPosition(-1000,-1000);
    }
    update(time,delta)
    {
        
    }
    kill(){
        this.parent.readyAimer();
        this.destroy();
    }

}

class SoulCrystal extends Phaser.Physics.Matter.Sprite{
    constructor(scene, x, y, texture, animationTexture, frame, sbid) {
        super(scene.matter.world, x, y, texture, frame)
        this.scene = scene;
        scene.matter.world.add(this);
        scene.add.existing(this); 

        this.setActive(true);
        const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
        const { width: w, height: h } = this;
        const mainBody = Bodies.rectangle(0, 0, w * 0.62, h*0.85, { chamfer: { radius: 10}, isSensor:true});

        const compoundBody = Body.create({
            parts: [mainBody],
            frictionStatic: 0,
            frictionAir: 0.00,
            friction: 0.0,
            restitution: 0.0,
            label: "SOULCRYSTAL"
          });
        this
        .setExistingBody(compoundBody)
        .setPosition(x, y)
        .setIgnoreGravity(true)
        .setCollisionCategory(CATEGORY.SOLID)
        .setCollidesWith([ CATEGORY.SOLANA]);   

        //Add to game update
        this.scene.events.on("update", this.update, this);
        console.log( x, y, texture, animationTexture, frame, sbid);
        this.anims.play(animationTexture, false);
        this.sbid = sbid;
        this.animationTexture = animationTexture;
        this.doCollect = false;
    }
    update(time,delta)
    {
        if(this.doCollect){            
            //Create Soulcrystal timeline for animation of collection
            hud.collectSoulCrystal(this.scene,this.x,this.y,2,this.texture.key,this.animationTexture,0,this.sbid)
            //Remove It.
            this.scene.events.off("update", this.update, this);
            this.destroy();
        }
    }
    collect(){
        this.doCollect = true;
    }
}
//Each Bit unlocks an ability for both Solana and Bright
class Solbit{
    constructor(id,n,desc){
        this.id = id;
        this.name = n;
        this.description = desc;
        this.aquired = false;   
    }
    collect(){
        //What do they do when collected?
        if(this.id == 0){
            //Handle the soulight initialization.
            soullight.claim();
            console.log("Collected", this.name, this.description);
        }
    }
}
//Solbits - Global
var solbits = [
    new Solbit(0,'Crystal of Sol','Carries the basic essense of Sol'),
    new Solbit(1,'Crystal of Mass','Carries the basic essense of Sol'),
    new Solbit(2,'Crystal of Fusion','Carries the basic essense of Sol'),
    new Solbit(3,'Crystal of Time','Carries the basic essense of Sol'),
    new Solbit(4,'Crystal of Power','Carries the basic essense of Sol'),
    new Solbit(5,'Crystal of Vacuum','Carries the basic essense of Sol')
];
//Solbit Utlity Functions
function checkSolbitOwned(index){
    if(index <= solbits.length && index > -1){
        return solbits[index].aquired;
    }else{
        return false;
    }
}

//6 Crystals: (Bits) : Yellow, Gray, Orange, Blue, Green, Pink
//Bright has a small aura himself.
//Start with no Soulight. Level 1 / Tutorial has lamps already lit.
//Manipulate switches, buttons and jump/move.
// Given Yellow: spawns the soulight. Allows the soulight to be transfered back and forth. Meet Bright nearby. He is in darkmode, but injured. - Crystal of Sol
// He can be "healed" by passing him the soullight.
// Learn that lamps can be lit by the soulight. Pressure plates to trigger gates.

//Orange (Found in village) - Slime Monster Boss - Crystal of Mass
// Double Jump / Wall Slide - Dark Surge (Dash forward) / Break - Bright Flare (Sends off a small temporary lamp)

//Blue (Found in Caves) - Corrupted Spider Boss - Crystal of Fusion
// Shield (Protection at cost of power) /Merge  - Bright burst /  Dark Slam (Greatly accelerates downwards and can smash objects he could not before.).

//Green (Found in Forest) - Corrupted Tree Boss - Crystal of Time
// Solana Light Dash  / Bright Beam - Blocks of Light to run on / Dark Warp (Time Slowing Bubble)

//Pink (Found in Mountain) - Corrupted Bear Boss - Crystal of Power
// Soullight Gains radius. Kills return more shards. / Dark can convert dark shards to health for solana.

//Gray (Found in Swamp) - Super Slime Monster Boss - Crystal of Vacuum 
// Fusion - Solana Teleports instantly to bright, taking soulight / Bright - Phase (Can pass thru certain barriers) / Dark - Singularity (Create a mini black hole. Attracts things, including solana.)




