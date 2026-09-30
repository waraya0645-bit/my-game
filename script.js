const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    backgroundColor: '#ffffff',

    pixelArt: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);


function preload() {
    this.load.image('player', './images/IMG_0410.png');
}


function create() {
    const player = this.add.image(400, 225, 'player');

    player.setDisplaySize(100, 100);


    // 指を置いた場所
    let startX = 0;
    let startY = 0;

    // 指を動かしているか
    let isDragging = false;


    // 指を置いたとき
    this.input.on('pointerdown', (pointer) => {
        startX = pointer.x;
        startY = pointer.y;

        isDragging = true;
    });


    // 指を動かしているとき
    this.input.on('pointermove', (pointer) => {

        if (!isDragging) {
            return;
        }

    });


    // 指を離したとき
    this.input.on('pointerup', (pointer) => {

        if (!isDragging) {
            return;
        }

        isDragging = false;


        // スライドした距離
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;


        // ほとんど動かしていなかったら何もしない
        const swipeDistance = Math.sqrt(dx * dx + dy * dy);

        if (swipeDistance < 10) {
            return;
        }


        // スライドした方向の角度
        const angle = Math.atan2(dy, dx);


        // Playerが進む距離
        const distance = 200;


        // 移動先
        const targetX = player.x + Math.cos(angle) * distance;
        const targetY = player.y + Math.sin(angle) * distance;


        // Playerを移動
        this.tweens.add({
            targets: player,
            x: targetX,
            y: targetY,
            duration: 500
        });
    });
}
