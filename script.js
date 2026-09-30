const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    backgroundColor: '#ffffff',

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

    this.input.on('pointerdown', (pointer) => {
        this.tweens.add({
            targets: player,
            x: pointer.x,
            y: pointer.y,
            duration: 500
        });
    });
}
