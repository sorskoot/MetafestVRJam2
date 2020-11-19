AFRAME.registerComponent('orb-collider', {
    tick: function (time, timeDelta) {
        const orbs = this.el.sceneEl.components.game.getOrbs();
        if(!orbs || !orbs.length || !this.el || !this.el.object3D) return;

        for (let i = 0; i < orbs.length; i++) {
            const element = orbs[i];            
            const dist = this.el.object3D.position.distanceTo(orbs[i].object3D.getWorldPosition());
            if(dist <= .3){
                orbs[i].setAttribute('explode','');
                this.el.sceneEl.components.game.addOrbScore();
                return;
            }
        }
    },
});