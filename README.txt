Space Runner

##########################
G A M E  M E C H A N I C S
##########################

########
GAMEPLAY:
########
Fly the spaceship through infinite space, shoot down green blocks and fly through/collect rings
to gain points, avoiding the red blocks. Shooting down red blocks will deduct the score.

Collect a blue gem to initiate a 20 second
bonus invincibility where all red blocks become green blocks and you cannot lose.

#######
SCORING:
#######

Collect ring +1
Shoot down red box -1
Shoot down green box +1

########
CONTROLS:
########
WASD to control the position of the spaceship, located in one of 9 quadrants.
___ ___ ___
_1_|_2_|_3_
_4_|_5_|_6_
_7_|_8_|_9_

1 = top left (AW)
2 = top (W)
3 = top right (WD)
4 = left (A)
5 = centre (nothing)
6 = right (D)
7 = bottom left (AS)
8 = bottom (S)
9 = bottom right (SD)

B - switch cameras
N - zoom in camera
M - zoom out camera
Enter - pause game/display controls
P - pause music;

Mouse to aim crosshair and left click to shoot.

#############
MOUSE PICKING:
#############
Use the mouse to aim the crosshair at cubes and shoot them down.
When a red cube is highlighted, it will turn blue to signify you are aiming at a red cube and will lose points.

######
CAMERA:
######
Switch between 2 different camera views using B
	- Behind/Above the spaceship: perspective view above/behind the spaceship, slightly easier to aim and shoot cubes.
	- Behind the spaceship: perspective view at level with the spaceship behind it, similar to the orthographic minimap.
	You can zoom in and out of both cameras using N(zoomin) and M(zoomout)

###################################
T H E  W H A T  A N D  T H E  H O W
###################################


3D Space:

Spaceship situated in 3D space. The spaceship flys through a moving textured cylinder (space image) to simulate the effect of flying through space. The spaceship is a 3D model and has a corresponding .mtl texture applied on it.

Since this is an infinite running game, the spaceship itself does not actually move in the z direction, and the objects flying at the spaceship are the only objects that move in the z direction. Once the obstacles reach a location behind the ship and out of the frame, reset them back similar to how they were initialized.

*NOTE* Moving the ship is smooth, not frame by frame jagged. I had trouble trying to apply a makeTranslation() matrix in order to change the location and still keep the movement of the spaceship smooth and not like the movement in project 2 (since that would destroy the gameplay). Therefore translateX() and translateY() was used to translate the spaceship.


ADDITIONAL FEATURE (maybe?)
Procedural generation of game elements:
The obstacles are generated randomly in 3D space. Each obstable can take on 3 different x and y positions, meaning 9 total possible locations corresponding to the 9 quandrants that the spaceship can occupy.
(fairly simple thought)

ADDITIONAL FEATURE:
Simple collision detection using tests of the obstacles' and spaceship's position. When space passes the boundary box of each object, react correspondingly. This is done by if statement iterating through the array containing each type of object.

3D Camera:

Multiple 3D cameras are implemented,
As described in the Game Mechanics section, the default camera is above/behind the spaceship, for a persepective view that minimizes obstruction of the obstacle objects by the spaceship(easier to aim). The second camera is one that is similar to the orthographic minimap, where the perspective camera is located behind and level with the spaceship.

ADDITIONAL FEATURE:
Orthographic minimap. This camera shows the incoming objects straight-on.

Lighting:
The spaceship and objects in space are lit initially using 2 white coloured directional lights, each situated at a far -z and z position to light all the objects within the game cylinder.

ADDITIONAL FEATURE:
When the spaceship collects an invincibility diamond, 2 additional high intensity blue lights are shined onto the spaceship, one above the ship and one below the ship. When the time of the invincibility is lower than 5, the object will start flashing 10 times each second and when the invincibility time  is lower than 2 seconds it will flash even faster at 20 flashes per second. This is done simply by removing the current invincibility lights and putting in the lights with the corresponding intensity at each frame.

Controls/Interactivity:
Keyboard interactivity is done with javascript and javascript keycodes and not the THREE js KeyboardState library we used in the past. This allows switch statements to be neatly implemented and stacking controls becomes easier. Also we have to use and import 1 less library. (Mainly preference)

Mouse controls applied in similar fashion to p2. I am checking for 'mousemove' and 'mousedown' events. On mousemove, I want the raycaster to highlight(turn blue) any red cubes it intersects over, and make sure that when the mouse leaves that object, it will turn back to its original shape.

On mouse down, there are two raycasters, one that's checking for red cube objects, and one that's checking for green cube objects. When the mouse is clicked, either add or subtract score corresponding to whether a red or green cube was hit.

On-screen control panel:
HUD elements shown as div elements in HTML. This allows for easy updating of variables and stylization of text using CSS. The text effects are generated online using the vast number of CSS tools available ( such as http://css3gen.com/text-shadow/)

FPS Counter implemented, average over every second.
Orthographic minimap implemented, showing the straight-on view of the gamespace. 

ADDITIONAL FEATURE:
Sound:
Each action and obstacle has their own corresponding sound effect. Test them out! These are implemented with HTML audio elements.
Shooting - blaster sound
Red cube/lose - mario lose music
Ring - mario coin sound

In addition, a continuous track loops in the background and can be paused/started using p. This is robust enough so that game sounds do not interfere with the state of the play/pause (if game music is currently pasued, then hitting or triggering another event will not cause the music to start playing again or vice versa).

Looped track - What is Love - Haddaway

####################
Sources/Inspiration:
####################
3D Star Wars fighter model and texture:
http://tf3dm.com/

Space picture/texture:
http://www.axsysnav.eu/space/

Infinite running game inspiration:
HelloRun by Hello Enjoy
http://hellorun.helloenjoy.com/

How to Make Starfox part 1(inspiration of some game mechanics):
https://www.youtube.com/watch?v=P2q5M50x5Uw

Inspiration on moving game texture:
https://www.packtpub.com/books/content/writing-3d-space-rail-shooter-threejs-part-1

For css designs/text shadows:
http://css3gen.com/text-shadow/
