AFRAME.registerComponent('selfdestruct', {
    schema: {
        timer: { default: 5000 }
    },
    update:function(){
        this.countdown = this.data.timer;
    },
    tick: function (time, timeDelta) { 
        this.countdown -= timeDelta;
        if(this.countdown < 0){
            this.el.remove();
        }
    }
});