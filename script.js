const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    backgroundColor: '#222222',

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
}

function create() {
    const player = this.add.rectangle(
        400,
        225,
        80,
        80,
        0xffffff
    );

    this.input.on('pointerdown', (pointer) => {
        this.tweens.add({
            targets: player,
            x: pointer.x,
            y: pointer.y,
            duration: 500
        });
    });
}
