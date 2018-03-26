/*
* @Name: 
* @Description: Screen dimmer to protect your eyes while get calm read in your screen
* @Version: 0.2
* @Author: Marcos Per
* @Source: https://github.com/MarcosPer
*/
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Mainloop = imports.mainloop;

let text, button;
let overlays = [];
let enabled = false;
let opacity = 150; //Change to set default opacity
let indicator;
let closeTimer = null;
let debug = false;

function init() {

    /* Create button in panel */
    button = new St.Bin({ reactive: true, can_focus: true, x_fill: true, y_fill: false, track_hover: true });
    
    /* Add icon to button */
    let icon = new St.Icon({ icon_name: 'dialog-information-symbolic', style_class: 'icon' });
    button.set_child(icon);

    /* Setup button events */
    button.connect('button-press-event', buttonEvent);
    button.connect('scroll-event', scrollEvent)

    /* Create indicator that will show in primaryMonitor when scroll */
    let primaryMonitor = Main.layoutManager.primaryMonitor;
    indicator = new St.Label({style_class: 'indicator'});

    /* Put indicator centered on screen */
    indicator.set_position(Math.floor(primaryMonitor.width / 2 - indicator.width / 2), Math.floor(primaryMonitor.height / 2 - indicator.height / 2));

    /* Create overlay for each monitor */
    let monitors = Main.layoutManager.monitors;
    for (i = 0; i < monitors.length; i++) {
        let monitor = monitors[i];
        /* Create overlay */
        let overlay = new St.Label({ style_class: 'overlay'});
        /* If debbuging set text to each screen */
        if(debug){
            overlay.set_text("Monitor "+i + " width: "+ monitor.width + " height: " + monitor.height + " Position X: " + monitor.x + " Y: "+ monitor.y)
        }
        /* Resize overlay as monitor resolution */ 
        overlay.set_height(monitor.height);
        overlay.set_width(monitor.width);
        /* Position overlay at monitor position */ 
        overlay.set_position(monitor.x, monitor.y);
        /* Add to overlays */
        this.overlays.push(overlay);
    }
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    destroyOverlay();
}
function showOverlay() {
    for (i = 0; i < overlays.length; i++) {
        Main.uiGroup.add_actor(overlays[i]);
    }
    enabled = true;
}

function hideOverlay() {
    for (i = 0; i < overlays.length; i++) {
      Main.uiGroup.remove_actor(overlays[i]);
    }
    enabled = false;
}
function destroyOverlay() {
    // Remove all overlays 
    for(i = 0; i< overlays.length; i++){
        Main.uiGroup.remove_actor(overlays[i]);
    }
    overlays = [];
    enabled = false;
}

function refreshOverlay() {
    for (i = 0; i < overlays.length; i++) {
        overlays[i].opacity = opacity;
    }
}

function scrollEvent(widget, event, pointer) {
    if(!enabled){
        showOverlay();
    }
    let direction = event.get_scroll_direction();
    switch (direction) {
        case 0:
            /* Scroll up */
            if (opacity < 255){
                opacity +=10;
            }
            break;
        case 1:
            /* Scroll down */
            if (opacity > 0) {
                opacity -=10;
            }
            break;
        default:
            break;
    }
    refreshOverlay();
    showIndicator();
}

function buttonEvent(widget, event, pointer) {
    if(enabled){
        hideOverlay();
    }else{
        showOverlay();
    }
}

function showIndicator(){
    let primaryMonitor = Main.layoutManager.primaryMonitor;
    let percent = Math.floor(opacity/255 * 100);
    indicator.set_text("Dim " + percent + "%");
    indicator.opacity = 255;
    Main.uiGroup.add_actor(indicator);
    Mainloop.source_remove(closeTimer);
    closeTimer = Mainloop.timeout_add(1500, function () { hideIndicator(); });
}

function hideIndicator() {
   Tweener.addTween(indicator,
    { opacity: 0,
      time: 2,
      transition: 'easeOutQuad',
      onComplete: () => { Main.uiGroup.remove_actor(indicator); }
    });
}