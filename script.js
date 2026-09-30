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

    // ドラッグ中かどうか
    let isDragging = false;


    // Playerの移動速度
    const speed = 300;


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


        // 最初に指を置いた場所から現在の指の位置まで
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;


        // スライドしている方向の角度
        const angle = Math.atan2(dy, dx);


        // Playerを一定速度で動かす
        player.x += Math.cos(angle) * speed * (1 / 60);
        player.y += Math.sin(angle) * speed * (1 / 60);
    });


    // 指を離したとき
    this.input.on('pointerup', () => {
        isDragging = false;
    });
}
