// Deploy Preview test
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    backgroundColor: '#c0c0c0',

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
    this.load.image('whiteCircle', './images/white_circle.png');
    this.load.image('blackCircle', './images/black_circle.png');
}

function create() {

    // プレイヤー
    const player = this.add.image(480, 270, 'player');
    this.player = player;

    // =========================
    // スティック
    // =========================

    // 最初は画面中央

    this.stickX = this.scale.width / 6;
    this.stickY = this.scale.height * 3 / 4;

    // 白い円
    this.whiteCircle = this.add.image(
        this.stickX,
        this.stickY,
        'whiteCircle'
    );

    // 黒い円
    this.blackCircle = this.add.image(
        this.stickX,
        this.stickY,
        'blackCircle'
    );

    this.whiteCircle.setAlpha(0.5);
    this.blackCircle.setAlpha(0.5);
    // 指を押しているか
    this.isDragging = false;

    // プレイヤー速度
    this.speed = 300;

    // =========================
    // 指を置いたとき
    // =========================

    this.input.on('pointerdown', (pointer) => {

        // 白い円をタップした場所へ移動
        this.stickX = pointer.x;
        this.stickY = pointer.y;

        this.whiteCircle.x = this.stickX;
        this.whiteCircle.y = this.stickY;

        // 黒い円を中央に戻す
        this.blackCircle.x = this.stickX;
        this.blackCircle.y = this.stickY;

        this.isDragging = true;
    });

    // =========================
    // 指を動かしているとき
    // =========================

    this.input.on('pointermove', (pointer) => {

        if (!this.isDragging) {
            return;
        }

        // 白い円の中心から指までの距離
        const dx = pointer.x - this.stickX;
        const dy = pointer.y - this.stickY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // 黒い円が動ける最大距離
        const maxDistance = 30;


        // 白い円の外へ出ないようにする
        if (distance > maxDistance) {

            const angle = Math.atan2(dy, dx);

            this.blackCircle.x =
                this.stickX + Math.cos(angle) * maxDistance;

            this.blackCircle.y =
                this.stickY + Math.sin(angle) * maxDistance;

        } else {

            this.blackCircle.x = pointer.x;
            this.blackCircle.y = pointer.y;
        }
    });

    // =========================
    // 指を離したとき
    // =========================

    this.input.on('pointerup', () => {

        this.isDragging = false;

        // 黒い円を中央へ戻す
        this.blackCircle.x = this.stickX;
        this.blackCircle.y = this.stickY;
    });
}

function update(time, delta) {

    if (!this.isDragging) {
        return;
    }

    // 白い円の中心から黒い円の中心への方向
    const dx = this.blackCircle.x - this.stickX;
    const dy = this.blackCircle.y - this.stickY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // ほとんど動かしていなければ停止
    if (distance < 5) {
        return;
    }

    // 移動方向
    const angle = Math.atan2(dy, dx);

    // 毎秒一定の速度
    const moveAmount = this.speed * (delta / 1000);
    
    this.player.x += Math.cos(angle) * moveAmount;
    this.player.y += Math.sin(angle) * moveAmount;

    // 画面端から出ないようにする
    const halfWidth = this.player.displayWidth / 2;
    const halfHeight = this.player.displayHeight / 2;
    
    this.player.x = Phaser.Math.Clamp(
        this.player.x,
        halfWidth,
        this.scale.width - halfWidth
    );
    
    this.player.y = Phaser.Math.Clamp(
        this.player.y,
        halfHeight,
        this.scale.height - halfHeight
    );
}
