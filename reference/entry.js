import { gl, setGl } from './ezgl.js'
import { Renderer, Mesh, Material } from './ezgfx.js'

let canvas = document.querySelector('canvas')

const XR = navigator['xr']
let xrButton = document.getElementById('xr-button')
let xrSession = null
let xrRefSpace = null

const lightShader = {
	vertex: "\n\
	out float v_Brightness;\n\
	vec4 vertex() {\
		\
		vec3 lightDirection = normalize(vec3(1.0, -1.0, -1.0));\
		\
		vec4 worldPoint = u_Model * vec4(a_Position, 1.0);\
		vec4 worldPointPlusNormal = u_Model * vec4(a_Position + normalize(a_Normal), 1.0);\
		\
		v_Brightness = -dot(normalize(worldPointPlusNormal.xyz - worldPoint.xyz), lightDirection);\
		\
		return u_Projection * u_View * worldPoint;\
	}",
	shader: "\
	in float v_Brightness;\
	vec4 shader() {\
		return vec4(u_Color.rgb * vec3(v_Brightness), 1.0);\
	}"
};


let controllers = {
	'left': null,
	'right': null
}

function onControllerUpdate(session, frame) {
	for (let inputSource of session['inputSources']) {
		if (inputSource['gripSpace']) {
			let gripPose = frame['getPose'](inputSource['gripSpace'], xrRefSpace)

			if (gripPose) {
				controllers[inputSource['handedness']] = {
					pose: gripPose,
					gamepadButtons: inputSource.gamepad.buttons
				}
			}
		}
	}
}

function onResize() {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}
window.onresize = onResize
onResize()

function initWebGL2() {
	const glContext = canvas.getContext('webgl2', { 'xrCompatible': true })
	setGl(glContext)
}

async function initWebXR() {
	if (!XR) {
		return
	}
	const supported = await XR['isSessionSupported']('immersive-vr')

	if (supported) {
		xrButton.disabled = false
		xrButton.textContent = "Enter VR"
		xrButton.addEventListener("click", onButtonClicked)
	}
}

async function onButtonClicked () {
	if (!xrSession) {
		xrSession = await XR['requestSession'](
			'immersive-vr',
			{
				'requiredFeatures': ["local-floor"]
			}
		)
		onSessionStarted()
	} else {
		xrSession.end()
	}
}

async function onSessionStarted() {
	xrSession.addEventListener("end", onSessionEnded)

	initWebGL2()

	xrSession['updateRenderState']({
		'baseLayer': new window['XRWebGLLayer'](xrSession, gl)
	})

	const renderer = new Renderer()
	renderer.depthTesting(true)

	const identityMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	])
	const offsetMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		-2.0, 1.0, -15.0, 1.0
	])

	const planeMesh = new Mesh();
	planeMesh.loadFromData([10,0,10,5.5,-4.5,0,1,0,-10,0,-10,-4.5,5.5,0,1,0,-10,0,10,-4.5,-4.5,0,1,0,10,0,10,5.5,-4.5,0,1,0,10,0,-10,5.5,5.5,0,1,0,-10,0,-10,-4.5,5.5,0,1,0])

	const planeMaterial = new Material(lightShader.vertex, null, lightShader.shader)
	planeMaterial.setProjection(identityMatrix)
	planeMaterial.setView(identityMatrix)
	planeMaterial.setModel(identityMatrix)

	planeMaterial.setColor([0.5, 0.5, 0.5, 1.0])

	const cubeMesh = new Mesh()
	cubeMesh.loadFromData([-1,1,1,0.625,0,-1,0,0,-1,-1,-1,0.375,0.25,-1,0,0,-1,-1,1,0.375,0,-1,0,0,-1,1,-1,0.625,0.25,0,0,-1,1,-1,-1,0.375,0.5,0,0,-1,-1,-1,-1,0.375,0.25,0,0,-1,1,1,-1,0.625,0.5,1,0,0,1,-1,1,0.375,0.75,1,0,0,1,-1,-1,0.375,0.5,1,0,0,1,1,1,0.625,0.75,0,0,1,-1,-1,1,0.375,1,0,0,1,1,-1,1,0.375,0.75,0,0,1,1,-1,-1,0.375,0.5,0,-1,0,-1,-1,1,0.125,0.75,0,-1,0,-1,-1,-1,0.125,0.5,0,-1,0,-1,1,-1,0.875,0.5,0,1,0,1,1,1,0.625,0.75,0,1,0,1,1,-1,0.625,0.5,0,1,0,-1,1,1,0.625,0,-1,0,0,-1,1,-1,0.625,0.25,-1,0,0,-1,-1,-1,0.375,0.25,-1,0,0,-1,1,-1,0.625,0.25,0,0,-1,1,1,-1,0.625,0.5,0,0,-1,1,-1,-1,0.375,0.5,0,0,-1,1,1,-1,0.625,0.5,1,0,0,1,1,1,0.625,0.75,1,0,0,1,-1,1,0.375,0.75,1,0,0,1,1,1,0.625,0.75,0,0,1,-1,1,1,0.625,1,0,0,1,-1,-1,1,0.375,1,0,0,1,1,-1,-1,0.375,0.5,0,-1,0,1,-1,1,0.375,0.75,0,-1,0,-1,-1,1,0.125,0.75,0,-1,0,-1,1,-1,0.875,0.5,0,1,0,-1,1,1,0.875,0.75,0,1,0,1,1,1,0.625,0.75,0,1,0])

	const cubeMaterial = new Material(lightShader.vertex, null, lightShader.shader)
	cubeMaterial.setProjection(identityMatrix)
	cubeMaterial.setView(identityMatrix)
	cubeMaterial.setModel(offsetMatrix)

	cubeMaterial.setColor([0.4, 0.3, 1.0, 1.0])

	const controllerMesh = new Mesh()
	controllerMesh.loadFromData( [-0.15127,0.469033,0.15127,0.625,0,-1,0,0,-0.15127,-0.469033,-0.15127,0.375,0.25,-1,0,0,-0.15127,-0.469033,0.15127,0.375,0,-1,0,0,-0.15127,0.469033,-0.15127,0.625,0.25,0,0,-1,0.15127,-0.469033,-0.15127,0.375,0.5,0,0,-1,-0.15127,-0.469033,-0.15127,0.375,0.25,0,0,-1,0.15127,0.469033,-0.15127,0.625,0.5,1,0,0,0.15127,-0.469033,0.15127,0.375,0.75,1,0,0,0.15127,-0.469033,-0.15127,0.375,0.5,1,0,0,0.15127,0.469033,0.15127,0.625,0.75,0,0,1,-0.15127,-0.469033,0.15127,0.375,1,0,0,1,0.15127,-0.469033,0.15127,0.375,0.75,0,0,1,0.15127,-0.469033,-0.15127,0.375,0.5,0,-1,0,-0.15127,-0.469033,0.15127,0.125,0.75,0,-1,0,-0.15127,-0.469033,-0.15127,0.125,0.5,0,-1,0,-0.15127,0.469033,-0.15127,0.875,0.5,0,1,0,0.15127,0.469033,0.15127,0.625,0.75,0,1,0,0.15127,0.469033,-0.15127,0.625,0.5,0,1,0,-0.15127,0.469033,0.15127,0.625,0,-1,0,0,-0.15127,0.469033,-0.15127,0.625,0.25,-1,0,0,-0.15127,-0.469033,-0.15127,0.375,0.25,-1,0,0,-0.15127,0.469033,-0.15127,0.625,0.25,0,0,-1,0.15127,0.469033,-0.15127,0.625,0.5,0,0,-1,0.15127,-0.469033,-0.15127,0.375,0.5,0,0,-1,0.15127,0.469033,-0.15127,0.625,0.5,1,0,0,0.15127,0.469033,0.15127,0.625,0.75,1,0,0,0.15127,-0.469033,0.15127,0.375,0.75,1,0,0,0.15127,0.469033,0.15127,0.625,0.75,0,0,1,-0.15127,0.469033,0.15127,0.625,1,0,0,1,-0.15127,-0.469033,0.15127,0.375,1,0,0,1,0.15127,-0.469033,-0.15127,0.375,0.5,0,-1,0,0.15127,-0.469033,0.15127,0.375,0.75,0,-1,0,-0.15127,-0.469033,0.15127,0.125,0.75,0,-1,0,-0.15127,0.469033,-0.15127,0.875,0.5,0,1,0,-0.15127,0.469033,0.15127,0.875,0.75,0,1,0,0.15127,0.469033,0.15127,0.625,0.75,0,1,0])

	const controllerMaterial = new Material(lightShader.vertex, null, lightShader.shader)
	controllerMaterial.setProjection(identityMatrix)
	controllerMaterial.setView(identityMatrix)
	controllerMaterial.setModel(identityMatrix)

	xrRefSpace = await xrSession['requestReferenceSpace']('local-floor')
	xrSession.requestAnimationFrame(onSessionFrame)

	function onSessionFrame(t, frame) {
		xrSession.requestAnimationFrame(onSessionFrame)

		let pose = frame['getViewerPose'](xrRefSpace)

		if (!pose) {
			return
		}

		let glLayer = xrSession['renderState']['baseLayer']

		onControllerUpdate(xrSession, frame)

		const leftController = controllers['left']
		const rightController = controllers['right']

		// if (leftController) {
		// 	let front = [0.0, 0.0, 0.0, 1.0];
		// 	let center = [0.0, 0.0, 0.0, 1.0];
		//
		// 	let matrix = leftController.pose['transform']['matrix'];
		//
		// 	mulVecByMat(front, matrix, [0.0, 0.0, -1.0, 1.0]);
		// 	mulVecByMat(center, matrix, [0.0, 0.0, 0.0, 1.0]);
		//
		// 	let xDir = front[0] - center[0];
		// 	let zDir = front[1] - center[1];
		// 	xDir = -xDir;
		//
		// 	const l = Math.sqrt(xDir * xDir + zDir * zDir);
		// 	xDir = xDir / l;
		// 	zDir = zDir / l;
		//
		// 	let xOffset = leftController.gamepad['axes'][3] * xDir + leftController.gamepad['axes'][2] * zDir;
		// 	let zOffset = leftController.gamepad['axes'][3] * zDir - leftController.gamepad['axes'][2] * xDir;
		//
		// 	xOffset *= 0.1;
		// 	zOffset *= 0.1;
		//
		// 	xrRefSpace = xrRefSpace['getOffsetReferenceSpace'](new window['XRRigidTransform']({ x: xOffset, y: 0.0, z: zOffset }));
		// }

		gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer['framebuffer'])

		renderer.clear([0.3, 1.0, 0.4, 1.0])

		for (let view of pose['views']) {
			const projectionMatrix = view['projectionMatrix']
			const inverseViewTransform = view['transform']['inverse']['matrix']
			let viewport = glLayer['getViewport'](view)
			gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)

			planeMaterial.setProjection(projectionMatrix)
			planeMaterial.setView(inverseViewTransform)

			renderer.draw(planeMesh, planeMaterial)

			cubeMaterial.setProjection(projectionMatrix)
			cubeMaterial.setView(inverseViewTransform)

			renderer.draw(cubeMesh, cubeMaterial)

			if (leftController) {
				controllerMaterial.setProjection(projectionMatrix)
				controllerMaterial.setView(inverseViewTransform)
				controllerMaterial.setModel(leftController.pose['transform']['matrix'])

				const red = leftController.gamepadButtons[0].value
				const green = leftController.gamepadButtons[1].value
				const blue = leftController.gamepadButtons[4].value

				controllerMaterial.setColor([red, green, blue, 1.0])

				renderer.draw(controllerMesh, controllerMaterial)
			}

			if (rightController) {
				controllerMaterial.setProjection(projectionMatrix)
				controllerMaterial.setView(inverseViewTransform)
				controllerMaterial.setModel(rightController.pose['transform']['matrix'])

				const red = rightController.gamepadButtons[0].value
				const green = rightController.gamepadButtons[1].value
				const blue = rightController.gamepadButtons[4].value

				controllerMaterial.setColor([red, green, blue, 1.0])

				renderer.draw(controllerMesh, controllerMaterial)
			}
		}
	}

	function onSessionEnded() {
		xrSession = null
	}
}

initWebXR()
