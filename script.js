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
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);


function preload() {
    this.load.image('player', './images/IMG_0410.png');
}


function create() {
    const player = this.add.image(400, 225, 'player');

    // Playerを保存
    this.player = player;

    // 指を置いた場所
    this.startX = 0;
    this.startY = 0;

    // 現在の指の位置
    this.pointerX = 0;
    this.pointerY = 0;

    // ドラッグ中かどうか
    this.isDragging = false;

    // Playerの速度
    this.speed = 300;


    // 指を置いたとき
    this.input.on('pointerdown', (pointer) => {
        this.startX = pointer.x;
        this.startY = pointer.y;

        this.pointerX = pointer.x;
        this.pointerY = pointer.y;

        this.isDragging = true;
    });


    // 指を動かしているとき
    this.input.on('pointermove', (pointer) => {

        if (!this.isDragging) {
            return;
        }

        // 指の現在位置だけ記録する
        this.pointerX = pointer.x;
        this.pointerY = pointer.y;
    });


    // 指を離したとき
    this.input.on('pointerup', () => {
        this.isDragging = false;
    });
}


function update(time, delta) {

    if (!this.isDragging) {
        return;
    }


    // 最初に指を置いた場所から
    // 現在の指の位置までの方向
    const dx = this.pointerX - this.startX;
    const dy = this.pointerY - this.startY;


    // 指がほとんど動いていない場合は停止
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
        return;
    }


    // スライド方向
    const angle = Math.atan2(dy, dx);


    // deltaを使って毎秒一定の速度で移動
    const moveAmount = this.speed * (delta / 1000);


    this.player.x += Math.cos(angle) * moveAmount;
    this.player.y += Math.sin(angle) * moveAmount;
}
