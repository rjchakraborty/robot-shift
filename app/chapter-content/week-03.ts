import type { ChapterContent } from "../chapter-content-types";

export const week03Content = {
  week: 3,
  title: "Dynamics and feedback",
  purpose:
    "Build the physical and control-system intuition needed to explain why a robot moves differently from the command we wrote, then measure whether a feedback controller is safe, stable, and repeatable.",
  prerequisites: [
    "Read a position from a number line or x-y graph and keep its unit and reference frame attached.",
    "Calculate a change, divide by elapsed time, and distinguish degrees from radians.",
    "Run a small Python or browser simulation and inspect a table or line plot.",
  ],
  outcomes: [
    "Distinguish position, velocity, acceleration, force, and torque by meaning and SI unit.",
    "Explain how mass, rotational inertia, friction, gravity, and actuator limits change motion.",
    "Trace open-loop and closed-loop control from setpoint through measurement, error, command, and physical response.",
    "Implement a bounded discrete PID experiment and explain what the P, I, and D terms contribute.",
    "Demonstrate how sampling, delay, noise, saturation, and integral windup can spoil an otherwise sensible controller.",
    "Produce a controller report with declared test conditions, plots, metrics, and honest failure cases.",
  ],
  jobTargets: [
    "Robotics Deployment, Integration & Validation Engineer",
    "Robotics Application / ROS 2 Integration Engineer",
    "Robotics Software Engineer — ROS 2 / AMR",
    "Robot HMI / Control & Monitoring Engineer",
  ],
  sources: [
    {
      label: "Modern Robotics — Chapter 11 Robot Control",
      url: "https://modernrobotics.northwestern.edu/chapters/chapter11/",
      useFor:
        "Closed-loop robot architecture, error response, P/PI/PID control, overshoot, steady-state error, and settling time.",
    },
    {
      label: "MIT Underactuated Robotics — The Simple Pendulum",
      url: "https://underactuated.mit.edu/pend.html",
      useFor:
        "A physical dynamics model that keeps inertia, gravity, damping friction, control torque, and torque limits visible.",
    },
    {
      label: "WPILib — Introduction to PID",
      url: "https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html",
      useFor:
        "Practical interpretation of proportional, derivative, and integral terms and common response shapes.",
    },
    {
      label: "WPILib — PID Control in WPILib",
      url: "https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html",
      useFor:
        "Discrete controller period assumptions, tolerances, output clamping, integral limits, and windup protection.",
    },
  ],
  days: [
    {
      dayId: 15,
      mentalModel:
        "A motion log is a flip-book. Position is one picture, velocity says how quickly the picture is changing, acceleration says how quickly that change is changing, and force or torque explains the push or twist that can cause it.",
      explanation: [
        "Position answers “where is it?” and is incomplete without a reference and a unit. A wheel encoder may report a shaft angle of 1.2 radians relative to its zero mark, while a localization system reports the robot at x=1.2 metres in the map frame. The same number does not make those measurements interchangeable.",
        "Velocity is change in position divided by elapsed time. Its sign carries direction: moving from 0.8 m to 0.5 m along the declared positive axis gives a negative average velocity. Acceleration is change in velocity divided by time, so a robot can have zero velocity for an instant while still having non-zero acceleration as it reverses direction.",
        "Force is a straight-line push or pull measured in newtons. Torque is a turning effect measured in newton-metres. For a perpendicular push, torque magnitude is force times distance from the axis; pushing a door near the hinge therefore makes much less torque than applying the same force at the handle.",
        "Kinematics describes motion without asking what caused it; dynamics connects motion to mass, inertia, forces, and torques. Robot software needs both stories: encoder samples tell us what moved, while the motor command and physical model help explain why it moved that way.",
      ],
      keyTerms: [
        {
          term: "Position",
          meaning: "A location or joint value relative to a declared zero, axis, and frame.",
          physicalExample: "A trolley is 0.70 m to the right of a tape mark.",
        },
        {
          term: "Velocity",
          meaning: "How quickly position changes, including direction.",
          physicalExample: "The trolley moves left at -0.20 m/s on an axis whose positive direction is right.",
        },
        {
          term: "Acceleration",
          meaning: "How quickly velocity changes.",
          physicalExample: "A rover speeds up from 0.10 m/s to 0.30 m/s in one second.",
        },
        {
          term: "Force",
          meaning: "A linear push or pull, measured in newtons.",
          physicalExample: "A spring scale pulls a cart with 2 N.",
        },
        {
          term: "Torque",
          meaning: "The turning effect of a force about an axis, measured in N·m.",
          physicalExample: "A 5 N perpendicular push 0.20 m from a hinge creates 1 N·m of torque.",
        },
      ],
      physicalExamples: [
        {
          title: "Hand-rolled toy car",
          scenario:
            "Mark the car's position every half-second while it coasts across a table. The position marks reveal direction and distance; differences between neighbouring marks reveal speed changes.",
          lookFor:
            "Nearly equal gaps mean nearly constant velocity. Growing gaps mean positive acceleration in the chosen direction; shrinking gaps mean acceleration opposite the motion.",
        },
        {
          title: "Door handle and hinge",
          scenario:
            "Gently push the same door with similar force first near the hinge and then at the handle, without slamming it.",
          lookFor:
            "The longer lever arm at the handle produces more torque, even though the applied force feels similar.",
        },
      ],
      workedExample: {
        title: "Turn position samples into a motion story",
        setup:
          "A cart is measured at 0.00 m, 0.30 m, 0.80 m, and 1.20 m at times 0 s, 1 s, 2 s, and 3 s.",
        steps: [
          "Declare the positive axis to point along the cart's travel and confirm every position is in metres.",
          "For 0–1 s, compute average velocity: (0.30-0.00)/(1-0)=0.30 m/s.",
          "For 1–2 s, compute (0.80-0.30)/1=0.50 m/s.",
          "For 2–3 s, compute (1.20-0.80)/1=0.40 m/s.",
          "Compare neighbouring interval velocities: the cart first gains 0.20 m/s, then loses 0.10 m/s.",
          "State the limitation: interval averages do not reveal every instant between samples.",
        ],
        result:
          "The cart travelled in the positive direction, sped up during the middle interval, then slowed during the final interval.",
        takeaway:
          "A useful motion claim names the axis, units, timestamps, calculation interval, and what the samples cannot prove.",
      },
      handsOn: {
        setup:
          "Use a toy car, bottle cap, or paper slider, masking-tape distance marks, a phone timer, and a table. Do not power a motor.",
        steps: [
          "Choose a zero mark, positive direction, distance unit, and a fixed camera or observer position.",
          "Move the object by hand and record its position at five equally spaced times.",
          "Put time, position, and position unit in a small table.",
          "Calculate the four interval velocities and keep their signs.",
          "Identify one interval where speed increased or decreased and calculate the velocity change.",
          "Draw position-versus-time and velocity-versus-time plots, then write one sentence about uncertainty from hand timing.",
        ],
        observe:
          "Notice that noisy marks affect velocity more than position because velocity uses the difference between two measurements.",
        doneWhen:
          "Another person can reproduce the table, check every unit and sign, and agree with the motion description.",
      },
      jobConnection: {
        roles: [
          "Robotics Deployment, Integration & Validation Engineer",
          "Robotics Software Engineer — ROS 2 / AMR",
        ],
        workExample:
          "During a field fault, compare encoder position and timestamps with computed velocity, acceleration, motor current, and command logs to decide whether the fault is measurement noise, blocked motion, or an unrealistic command.",
        interviewPrompt:
          "A robot reports correct final position but occasionally jerks. Which position, velocity, acceleration, force or torque evidence would you capture, and why?",
      },
      commonMistakes: [
        {
          mistake: "Writing “speed = -0.2 m/s.”",
          correction:
            "Speed is a non-negative magnitude; -0.2 m/s is velocity and its minus sign indicates direction.",
        },
        {
          mistake: "Calling N·m a joule because the base units match.",
          correction:
            "Torque and energy share dimensional units but represent different physical quantities; retain N·m for torque and J for energy.",
        },
        {
          mistake: "Computing a change without the elapsed time or reference axis.",
          correction:
            "Record timestamps and axis direction before calculating velocity or acceleration.",
        },
      ],
      checkQuestions: [
        {
          question: "Can an object have zero velocity and non-zero acceleration?",
          answer:
            "Yes. At the instant it reverses direction, velocity can be zero while acceleration is already changing that velocity.",
        },
        {
          question: "Why does the same push open a door more easily at the handle?",
          answer:
            "The handle is farther from the hinge, so the lever arm and resulting torque are larger.",
        },
        {
          question: "What information must accompany a robot position value?",
          answer:
            "At minimum its unit, reference frame or zero, axis or joint meaning, and usually its timestamp.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The available feedback-loop visual does not clarify the five distinct physical quantities better than the motion table and door experiment.",
      },
    },
    {
      dayId: 16,
      mentalModel:
        "A controller asks for motion, but the robot's body negotiates the result. A heavy or widely spread load is harder to accelerate, friction consumes some effort, and the actuator cannot provide more than its physical limit.",
      explanation: [
        "Mass measures resistance to linear acceleration. Rotational inertia plays the corresponding role for angular acceleration, but it also depends on where the mass sits relative to the rotation axis. Moving a battery farther from an arm joint can make that joint much harder to accelerate even though total mass is unchanged.",
        "Friction is not one magic constant. Static friction must be overcome before a resting part starts moving; kinetic friction acts while surfaces slide; bearings and gears also add speed-dependent losses and backlash. A low command may therefore produce no motion, while a slightly larger command suddenly moves the mechanism.",
        "An actuator has finite voltage, current, torque, speed, and thermal capacity. In the simplified single-axis relation net torque = inertia × angular acceleration, a requested acceleration is impossible when the needed net torque exceeds the available torque after gravity and friction are accounted for.",
        "A controller cannot repair missing physical authority by endlessly raising its gain. Good engineering separates the requested command, the clamped command actually sent, the measured response, and the reason for any limit. That evidence prevents a software tuning problem from being confused with undersized hardware or a jam.",
      ],
      keyTerms: [
        {
          term: "Mass",
          meaning: "Resistance to linear acceleration, measured in kilograms.",
          physicalExample: "The same push accelerates an empty trolley more than a loaded trolley.",
        },
        {
          term: "Rotational inertia",
          meaning: "Resistance to angular acceleration about a chosen axis; it depends on mass distribution.",
          physicalExample: "A long bar is harder to spin when weights are fixed near its ends.",
        },
        {
          term: "Friction",
          meaning: "A force or torque that opposes relative motion or the start of motion.",
          physicalExample: "A drawer needs a larger first pull, then a smaller pull to keep sliding.",
        },
        {
          term: "Actuator limit",
          meaning: "A physical or configured bound on torque, force, speed, current, voltage, or temperature.",
          physicalExample: "A servo cannot produce more than its rated torque without stalling, overheating, or violating its limits.",
        },
        {
          term: "Net torque",
          meaning: "The signed sum of driving and resisting torques about an axis.",
          physicalExample: "Motor torque minus friction and gravity torque is what remains to accelerate an arm.",
        },
      ],
      physicalExamples: [
        {
          title: "Mass near versus far from a pivot",
          scenario:
            "Tape two equal coins near the centre of a cardboard strip, then move them near the ends and gently twist the strip about its centre.",
          lookFor:
            "The total mass stays the same, but spreading it farther from the axis increases rotational inertia and makes quick angular changes harder.",
        },
        {
          title: "Loaded spool",
          scenario:
            "Imagine one small motor winding a string that lifts an empty cup and then a cup containing washers.",
          lookFor:
            "More load needs more torque. Near the motor's limit, acceleration falls; beyond the limit the lift stalls even if software requests more.",
        },
      ],
      workedExample: {
        title: "Check whether a requested acceleration is physically possible",
        setup:
          "A simplified single-axis arm has rotational inertia I=0.50 kg·m². The controller requests angular acceleration 4 rad/s². The actuator limit is 1.20 N·m, and opposing friction is estimated as 0.20 N·m.",
        steps: [
          "Use the simplified net relation τ_net=Iα for this one-axis example.",
          "Compute needed net torque: 0.50×4=2.00 N·m.",
          "Add the opposing friction that the motor must also overcome: requested motor torque is about 2.20 N·m.",
          "Compare 2.20 N·m with the 1.20 N·m actuator limit; the request is impossible.",
          "At the limit, subtract friction: only 1.20-0.20=1.00 N·m remains for acceleration.",
          "Compute achievable acceleration: 1.00/0.50=2.00 rad/s² under these simplifying assumptions.",
        ],
        result:
          "The bounded actuator can provide about 2 rad/s², not the requested 4 rad/s², before considering gravity or changing inertia.",
        takeaway:
          "Always compare required effort with available effort; a larger controller number does not create more motor capability.",
      },
      handsOn: {
        setup:
          "Use a ruler or cardboard strip, a pencil as a pivot, and two identical coins. Keep the experiment unpowered and clear of fragile objects.",
        steps: [
          "Balance the strip on the pivot and mark the rotation axis.",
          "Attach both coins close to the axis and gently start and stop a small rotation.",
          "Move the same coins near the two ends and repeat with a similar hand motion.",
          "Write what stayed constant: total mass, pivot, and approximate applied motion.",
          "Write what changed: mass distribution and rotational response.",
          "Sketch a motor-command log that separately records request, limit, sent command, and measured angle.",
        ],
        observe:
          "The far-out coin arrangement resists changes in angular velocity more strongly even though it weighs exactly the same.",
        doneWhen:
          "You can explain the result using rotational inertia and can name at least two real actuator limits a robot log should expose.",
      },
      jobConnection: {
        roles: [
          "Robotics Deployment, Integration & Validation Engineer",
          "Robotics Application / ROS 2 Integration Engineer",
        ],
        workExample:
          "During commissioning, compare payload location, motor-current limit, joint torque estimate, friction, and tracking error before changing controller gains.",
        interviewPrompt:
          "An arm works empty but stalls with a box held far from the joint. Explain the likely physics and the evidence you would collect before changing software.",
      },
      commonMistakes: [
        {
          mistake: "Treating rotational inertia as another name for mass.",
          correction:
            "Mass is part of inertia, but the distance and distribution of that mass around the chosen axis also matter.",
        },
        {
          mistake: "Assuming zero measured motion means zero command.",
          correction:
            "The command may be consumed by static friction, gravity, a hard stop, or saturation; log both command and response.",
        },
        {
          mistake: "Using τ=Iα without naming the simplifications.",
          correction:
            "For a real robot also account for gravity, friction, coupling, changing inertia, and external contact forces.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does moving a payload farther from a joint matter?",
          answer:
            "It increases rotational inertia and often gravity torque, so more joint torque is needed for the same motion.",
        },
        {
          question: "What happens when requested torque exceeds the actuator limit?",
          answer:
            "The applied torque is bounded by the available limit, so the requested acceleration or tracking cannot be achieved.",
        },
        {
          question: "Why should requested and applied commands be logged separately?",
          answer:
            "Their difference reveals saturation or safety limiting instead of falsely blaming the controller calculation.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The existing generic feedback visual does not show payload distribution or torque budgeting; the numeric torque budget is more precise.",
      },
    },
    {
      dayId: 17,
      mentalModel:
        "Open loop is giving an instruction without checking the result. Closed loop adds a measuring path: request, act, measure, compare, correct, and repeat.",
      explanation: [
        "An open-loop controller chooses a command from time, a planned trajectory, or a model but does not use the measured output to correct the next command. It can be simple and fast, yet an unexpected slope, payload, low battery, or obstruction creates an error it cannot see.",
        "A closed-loop controller measures the actual output y, compares it with the reference r, and forms an error such as e=r-y. Negative feedback chooses the command direction so that the next response tends to reduce this error. A wrong sensor sign or motor sign can turn that helpful loop into positive feedback that drives the error larger.",
        "Feedback is not automatically safe or stable. The measurement can be noisy or late, the command can saturate, and the physical mechanism can respond much more slowly than expected. The loop must therefore include explicit units, sign conventions, timing, output limits, and a safe failure path.",
        "Feedforward and feedback are partners, not enemies. A known model can request the effort likely needed for the planned motion, while feedback corrects remaining model error and disturbances. Week 3 uses simple feedback first so every signal in the loop remains visible.",
      ],
      keyTerms: [
        {
          term: "Setpoint",
          meaning: "The requested value the controller should track.",
          physicalExample: "A wheel-speed setpoint of 0.5 m/s.",
        },
        {
          term: "Measurement",
          meaning: "The sensed estimate of the system's actual output.",
          physicalExample: "An encoder-derived wheel speed of 0.42 m/s.",
        },
        {
          term: "Error",
          meaning: "A declared comparison between request and measurement, commonly e=r-y.",
          physicalExample: "0.50-0.42=0.08 m/s of positive speed error.",
        },
        {
          term: "Open-loop control",
          meaning: "Command generation without measured output correcting the next command.",
          physicalExample: "Running a motor for a fixed time and assuming it reached the intended angle.",
        },
        {
          term: "Closed-loop control",
          meaning: "Command generation that repeatedly uses measured output to reduce error.",
          physicalExample: "Reading an encoder and adjusting motor effort until the joint reaches the target.",
        },
      ],
      physicalExamples: [
        {
          title: "Timed heater versus thermostat",
          scenario:
            "A timed heater runs for five minutes regardless of room temperature; a thermostat measures temperature and switches based on the error from its setpoint.",
          lookFor:
            "Open-loop timing cannot respond to an open window, while the closed loop detects the resulting temperature change.",
        },
        {
          title: "Paper token placement",
          scenario:
            "Slide a token once toward a target with your eyes closed, then repeat using small moves and a visual check after each move.",
          lookFor:
            "The second method uses measurement to reduce error, but too-large corrections can still overshoot back and forth.",
        },
      ],
      workedExample: {
        title: "Trace two proportional feedback updates",
        setup:
          "A slider target is r=10 cm. Its first measurement is y=8 cm. Use e=r-y and a proportional rule u=0.5e, where u is a small simulated movement command in centimetres.",
        steps: [
          "Compute the first error: e=10-8=2 cm.",
          "Compute the first command: u=0.5×2=1 cm in the positive direction.",
          "After the simulated plant responds, measure again; suppose y becomes 9 cm.",
          "Compute the new error: 10-9=1 cm.",
          "Compute the new command: 0.5×1=0.5 cm.",
          "Confirm that the commands shrink as the measured output approaches the setpoint.",
        ],
        result:
          "The loop requests 1 cm, then 0.5 cm, because each fresh measurement reports a smaller error.",
        takeaway:
          "Closed loop is a repeated information path, not one formula: measure again before deciding the next correction.",
      },
      handsOn: {
        setup:
          "Use a paper token, a ruler, and a target line 10 cm from the starting point. Keep every move manual.",
        steps: [
          "Run an open-loop trial: close your eyes, make one estimated 10 cm slide, then measure final error.",
          "Reset the token and declare e=target position minus measured position.",
          "Run a closed-loop trial using u=0.5e after each measurement.",
          "Stop after six corrections or when absolute error is at most 2 mm.",
          "Record measurement, error, and command for every step.",
          "Repeat with a deliberately reversed sign on paper only and explain why it would increase error; do not perform unsafe motion.",
        ],
        observe:
          "Correctly signed feedback usually reduces the error step by step, while the written reversed-sign sequence moves away from the target.",
        doneWhen:
          "Your table distinguishes setpoint, measurement, error, and command, and you can point to the return measurement path in the visual.",
      },
      jobConnection: {
        roles: [
          "Robot HMI / Control & Monitoring Engineer",
          "Robotics Application / ROS 2 Integration Engineer",
        ],
        workExample:
          "Expose requested state, measured state, tracking error, command, freshness, and limit status so an operator can distinguish a bad request from a failed sensor or actuator.",
        interviewPrompt:
          "Draw a wheel-speed feedback loop and explain how you would detect a reversed encoder sign before allowing full-power operation.",
      },
      commonMistakes: [
        {
          mistake: "Calling any automated command closed loop.",
          correction:
            "It is closed loop only when measured output influences a later command.",
        },
        {
          mistake: "Assuming negative feedback from the minus sign alone.",
          correction:
            "Verify the complete sensor and actuator sign chain; a reversed motor or encoder can make physical feedback positive.",
        },
        {
          mistake: "Believing feedback guarantees stability.",
          correction:
            "Gain, delay, sampling, noise, saturation, and plant dynamics still decide the response.",
        },
      ],
      checkQuestions: [
        {
          question: "What information closes a control loop?",
          answer:
            "A measurement of actual output is compared with the request and influences a later command.",
        },
        {
          question: "Why can open loop work in one test but miss the target after a payload change?",
          answer:
            "It does not measure and correct the different physical response caused by the new payload.",
        },
        {
          question: "What does a reversed sensor sign do to a correction loop?",
          answer:
            "It can make a command increase the measured error, creating positive feedback and possible runaway.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A single block-and-return-path diagram materially clarifies what information makes a loop closed and where sign errors enter.",
      },
    },
    {
      dayId: 18,
      mentalModel:
        "A PID controller combines three limited opinions about error: P reacts to the error now, I accumulates a persistent bias, and D resists error changing too quickly.",
      explanation: [
        "The proportional term is Kp times current error. It acts like a software spring: a larger displacement from the setpoint requests a larger correction. Too little proportional action can feel weak; too much can overshoot or oscillate because the physical mechanism and measurement arrive after the command.",
        "The derivative term uses the rate of error change. With a fixed setpoint it behaves like damping, opposing rapid motion toward or away from the goal. A discrete controller estimates that rate from two samples, so noisy measurements or an incorrect sample interval can make the derivative contribution jump sharply.",
        "The integral term sums error over time. It can remove a persistent offset caused by gravity, friction, or model bias, but it adds memory to the controller. If the actuator is already at its limit, that stored error can grow into windup and cause a long recovery or large overshoot.",
        "PID gains carry units and belong to one defined signal path. Tune in simulation with a bounded command: verify sign and timing, start with P, add D only when damping is needed, and add I only for a measured persistent bias with anti-windup. A good feedforward model may remove the need for much integral action.",
      ],
      keyTerms: [
        {
          term: "Proportional term",
          meaning: "A command contribution proportional to current error.",
          physicalExample: "A larger joint-angle error requests a larger restoring torque.",
        },
        {
          term: "Integral term",
          meaning: "A command contribution based on accumulated error over time.",
          physicalExample: "A small gravity-caused arm error gradually builds enough correction to hold the target.",
        },
        {
          term: "Derivative term",
          meaning: "A command contribution based on how quickly error changes.",
          physicalExample: "Like a door closer, it resists a rapid approach and reduces overshoot.",
        },
        {
          term: "Gain",
          meaning: "A scale factor with units that converts an error quantity into a command contribution.",
          physicalExample: "A speed-loop Kp might convert m/s of error into volts.",
        },
        {
          term: "Discrete update",
          meaning: "One controller calculation using samples separated by a declared time step.",
          physicalExample: "A loop recalculates every 0.05 s at 20 Hz.",
        },
      ],
      physicalExamples: [
        {
          title: "Door closer as P plus D intuition",
          scenario:
            "A spring pulls a door toward closed based on how far it is open, while the hydraulic closer resists fast motion.",
          lookFor:
            "The spring resembles proportional restoring action; the damper resembles derivative action for a fixed target.",
        },
        {
          title: "Vertical arm holding a load",
          scenario:
            "A joint can stop slightly below its setpoint because gravity requires continuing effort even when motion has stopped.",
          lookFor:
            "Integral action may reduce the remaining offset, but model-based gravity feedforward can supply the known holding effort more directly.",
        },
      ],
      workedExample: {
        title: "Calculate one discrete PID update with units visible",
        setup:
          "In a simulation, current error e=3 cm, previous error=2 cm, sample time Δt=0.1 s, stored integral before this step=0.4 cm·s, Kp=2 command/cm, Ki=1 command/(cm·s), and Kd=0.5 command·s/cm.",
        steps: [
          "Compute P: 2×3=6 command units.",
          "Update accumulated error: 0.4+(3×0.1)=0.7 cm·s.",
          "Compute I: 1×0.7=0.7 command units.",
          "Estimate error rate: (3-2)/0.1=10 cm/s.",
          "Compute D: 0.5×10=5 command units.",
          "Add the three requested contributions: 6+0.7+5=11.7 command units.",
          "Mark this as an unconstrained request; a separate output limit must be applied before any actuator.",
        ],
        result:
          "The requested PID output is 11.7 command units, with P=6, I=0.7, and D=5 shown separately.",
        takeaway:
          "Log each term independently; a surprisingly large D value or growing I value becomes visible immediately.",
      },
      handsOn: {
        setup:
          "Create a simple spreadsheet or Python simulation of a value y that updates as y_next=y+0.1u, with setpoint 1.0 and command clamped to [-2,2].",
        steps: [
          "Run ten steps with Kp=0.5, Ki=0, Kd=0 and record y, error, P, and command.",
          "Increase Kp to 2.0 and compare approach speed and overshoot.",
          "Add Kd=0.2 while keeping Ki=0 and compare the response.",
          "Introduce a small constant opposing bias in the simulated plant and observe steady-state error.",
          "Add a small Ki with an integral bound and compare the offset and overshoot.",
          "Plot setpoint, measurement, and applied command; change only one gain per trial.",
        ],
        observe:
          "P changes corrective strength, D changes damping, and I can remove bias while also storing error and increasing overshoot risk.",
        doneWhen:
          "The notebook contains comparable plots, the exact gains and time step, and a written reason for each observed change.",
      },
      jobConnection: {
        roles: [
          "Robotics Software Engineer — ROS 2 / AMR",
          "Robotics Application / ROS 2 Integration Engineer",
        ],
        workExample:
          "Implement and review a velocity or joint controller whose logs expose setpoint, measurement, P/I/D contributions, clamped output, and loop period.",
        interviewPrompt:
          "A controller oscillates after Kp was increased. Describe a safe tuning investigation and explain when you would add D, I, or feedforward.",
      },
      commonMistakes: [
        {
          mistake: "Tuning all three gains at once.",
          correction:
            "Verify sign and timing, establish a P baseline, then add one justified term at a time and compare fixed tests.",
        },
        {
          mistake: "Treating gains as unitless magic numbers.",
          correction:
            "Record measurement unit, command unit, and time base; changing units changes the numeric gains.",
        },
        {
          mistake: "Adding integral for every tracking problem.",
          correction:
            "Use it only for measured persistent bias and protect it from windup; prefer accurate feedforward for known physics when available.",
        },
      ],
      checkQuestions: [
        {
          question: "Which PID term responds directly to current error?",
          answer:
            "The proportional term responds directly: its contribution is `K_p e(t)`, so it changes immediately when the current error changes.",
        },
        {
          question: "Why can the derivative contribution jump on noisy data?",
          answer:
            "It divides the difference between nearby error samples by the sample time, so small measurement changes can become a large estimated rate.",
        },
        {
          question: "What must be stated when sharing PID gains?",
          answer:
            "The controller form, signal and command units, sample period, derivative/integral implementation, and output limits.",
        },
      ],
      visual: {
        show: false,
        mode: "math",
        reason:
          "The worked calculation already separates P, I, and D more specifically than the shared feedback graphic, avoiding a second near-duplicate loop visual.",
      },
    },
    {
      dayId: 19,
      mentalModel:
        "A digital controller sees the robot through a flip-book delivered late and with smudges. Faster pages can help, but delay, uneven timing, and noisy differences can still make the correction wrong.",
      explanation: [
        "Sampling converts continuous motion into measurements at separate instants. A rate f in hertz means f samples each second, and its ideal period is Δt=1/f. The controller calculation must use the real or configured period consistently; assuming 0.05 s while updates arrive irregularly changes derivative and integral calculations.",
        "Latency is elapsed time from the physical event to the command that responds to it. Sensor exposure, filtering, transport, scheduling, calculation, and actuator response all contribute. Delay means the controller corrects an older state, so high gain can push the robot past the target before the measurement reveals what happened.",
        "Noise is unwanted variation in a measurement. Differencing two noisy samples to estimate a derivative can amplify that variation, especially when divided by a small time step. Filtering may help but usually adds its own delay, so the engineering question is not “filter or no filter” but the measured tradeoff for the task.",
        "Jitter is variation in update timing. Average frequency alone can hide occasional long gaps that matter to a fast mechanism. Logs should therefore retain sensor timestamp, receipt time, controller-start time, command-send time, and the age of data used for each command.",
      ],
      keyTerms: [
        {
          term: "Sampling rate",
          meaning: "The number of updates or measurements per second, measured in hertz.",
          physicalExample: "20 Hz means one intended update every 0.05 s.",
        },
        {
          term: "Latency",
          meaning: "Delay from an event or measurement to the resulting useful response.",
          physicalExample: "A camera frame is 100 ms old when an arm command uses it.",
        },
        {
          term: "Noise",
          meaning: "Measurement variation that is not the physical change being estimated.",
          physicalExample: "A stationary encoder angle jumps slightly between adjacent readings.",
        },
        {
          term: "Jitter",
          meaning: "Variation in the time between updates.",
          physicalExample: "A nominal 20 ms loop sometimes takes 45 ms.",
        },
        {
          term: "Data age",
          meaning: "How old a measurement is at the moment it is used.",
          physicalExample: "now minus sensor timestamp equals 80 ms.",
        },
      ],
      physicalExamples: [
        {
          title: "Delayed shower",
          scenario:
            "Hot water reaches the shower some time after the tap is turned. Turning again before the previous change arrives creates alternating too-hot and too-cold corrections.",
          lookFor:
            "The person is acting on an old temperature, just as a controller can act on stale state.",
        },
        {
          title: "Choppy video call",
          scenario:
            "A call may report a good average frame rate while occasional freezes make conversation difficult.",
          lookFor:
            "Average rate hides jitter and data age; the longest gaps can matter more than the mean.",
        },
      ],
      workedExample: {
        title: "Translate rate, delay, and noise into controller numbers",
        setup:
          "A loop is configured for 20 Hz. Measurement latency is 100 ms. Two consecutive noisy error samples differ by 0.02 units.",
        steps: [
          "Convert rate to period: Δt=1/20=0.05 s=50 ms.",
          "Express latency in periods: 100 ms/50 ms=2 sample intervals.",
          "Interpret this carefully: the controller can be reacting to a state about two intended updates old.",
          "Estimate the discrete error-rate contribution: 0.02/0.05=0.4 units/s.",
          "Repeat mentally at 100 Hz: the same 0.02 difference divided by 0.01 s becomes 2 units/s.",
          "Conclude that increasing rate does not by itself remove noise or latency and can magnify an unfiltered difference term.",
        ],
        result:
          "The 20 Hz loop has a 50 ms period, sees roughly two periods of latency, and turns 0.02 sample noise into a 0.4 units/s derivative estimate.",
        takeaway:
          "Always convert timing into the same units and compare data age and worst-case delay with the mechanism's response time.",
      },
      handsOn: {
        setup:
          "Reuse the Day 18 bounded simulation; do not connect it to powered hardware.",
        steps: [
          "Run a fixed P controller with no added delay and save the response.",
          "Insert a one-sample measurement delay, rerun with the same gain, and compare overshoot.",
          "Insert a two-sample delay and record whether oscillation grows.",
          "Add a repeating small measurement disturbance such as +0.01, -0.01.",
          "Enable the same D term from Day 18 and inspect its contribution.",
          "Log configured period, actual step time, measurement age, and maximum absolute command for every trial.",
        ],
        observe:
          "Delay shifts correction later; noise can make the derivative contribution alternate even while the true simulated state changes smoothly.",
        doneWhen:
          "A comparison table connects each timing or noise change to overshoot, settling, command activity, and one design decision.",
      },
      jobConnection: {
        roles: [
          "Robot HMI / Control & Monitoring Engineer",
          "Robotics Deployment, Integration & Validation Engineer",
        ],
        workExample:
          "Design stale-state indicators and a fault test that injects delayed telemetry, uneven update intervals, and noisy measurements while verifying bounded safe behaviour.",
        interviewPrompt:
          "A dashboard shows 20 Hz telemetry, but the robot still responds late. Which timestamps and worst-case timing measures distinguish low rate, latency, and jitter?",
      },
      commonMistakes: [
        {
          mistake: "Reporting only average loop frequency.",
          correction:
            "Also report worst-case period, jitter distribution, deadline misses, and data age.",
        },
        {
          mistake: "Using arrival time as if it were measurement time.",
          correction:
            "Preserve the sensor timestamp and calculate how old the physical observation is when used.",
        },
        {
          mistake: "Increasing sample rate while reusing gains and derivative code unchanged.",
          correction:
            "Keep the actual Δt in discrete calculations and revalidate noise, delay, and stability.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the ideal period of a 50 Hz loop?",
          answer: "1/50 s = 0.02 s = 20 ms.",
        },
        {
          question: "Why can delay cause overshoot?",
          answer:
            "The controller keeps correcting an older state and may not see that the mechanism has already passed the target.",
        },
        {
          question: "Why is a timestamp inside the sensor message useful?",
          answer:
            "It lets the consumer compute measurement age instead of confusing transport arrival with physical observation time.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The available visual is a generic feedback loop; the controlled simulation comparison makes delay and noisy differentiation observable without another repeated diagram.",
      },
    },
    {
      dayId: 20,
      mentalModel:
        "Saturation is a robot saying “I cannot deliver more.” Anti-windup stops the controller's memory from continuing to demand an impossible command while that limit is active.",
      explanation: [
        "A software controller can calculate any number, but a real actuator has a finite safe command range. Saturation maps the requested output to that range: a request of 11 with limits [-5,5] becomes an applied command of 5. The controller must log both values so saturation is visible rather than silently hidden.",
        "Integral windup occurs when error continues to accumulate while the actuator is saturated and cannot produce the requested response. When the target changes or the mechanism finally becomes free, the stored integral keeps commanding in the old direction, causing slow recovery or overshoot.",
        "Common anti-windup approaches include limiting the integral contribution, integrating only when the output is not saturated or when the error would move it out of saturation, and feeding the difference between requested and applied command back into the integral state. Each method must be tested at entry to and recovery from the limit.",
        "A controller clamp is not the whole robot safety system. Hardware current limits, joint limits, velocity limits, collision checks, watchdogs, emergency stop, and risk assessment serve different purposes. Never use a tuning experiment to discover a physical safety boundary on an unprotected powered mechanism.",
      ],
      keyTerms: [
        {
          term: "Saturation",
          meaning: "The applied command has reached a configured or physical limit.",
          physicalExample: "A request for 14 V is limited to the available safe 12 V or lower configured bound.",
        },
        {
          term: "Clamping",
          meaning: "Bounding a value to a minimum and maximum.",
          physicalExample: "clamp(11,-5,5) returns 5.",
        },
        {
          term: "Integral windup",
          meaning: "Excess stored error accumulated while the actuator cannot deliver the requested command.",
          physicalExample: "A stalled lift keeps storing upward error and surges after the obstruction clears.",
        },
        {
          term: "Anti-windup",
          meaning: "A rule that limits or corrects integral state during saturation.",
          physicalExample: "Pause integration when the output is at its upper limit and positive error would push it higher.",
        },
        {
          term: "Command authority",
          meaning: "The actual range of physical effect the actuator can safely produce.",
          physicalExample: "A steering motor has enough torque for an empty rover but not for a jammed wheel.",
        },
      ],
      physicalExamples: [
        {
          title: "Blocked drawer",
          scenario:
            "Imagine continuing to pull harder on a drawer already held by a physical stop, then storing every extra pull as a future instruction.",
          lookFor:
            "The stop prevents more motion now; replaying the stored effort after release would be the dangerous windup analogy.",
        },
        {
          title: "Hill-limited rover",
          scenario:
            "A rover asks for more wheel effort on a slope until its configured current limit is reached.",
          lookFor:
            "Tracking error can remain even with maximum applied command; higher software demand cannot overcome insufficient torque or traction.",
        },
      ],
      workedExample: {
        title: "Compare a wound-up integrator with conditional integration",
        setup:
          "A simulated PID requests u=11, the safe command range is [-5,5], error e=3, sample time Δt=0.1 s, and the current integral state is 1.0 error·s.",
        steps: [
          "Clamp the request: u_applied=5 and record saturation=true.",
          "Without protection, compute added integral error: eΔt=3×0.1=0.3 error·s.",
          "The unprotected integral state becomes 1.3 error·s even though no extra command can be applied.",
          "For conditional integration, notice that positive error would push farther above the upper limit.",
          "Pause that integral update, leaving the protected state at 1.0 error·s.",
          "When the error becomes negative, allow integration because it helps move the request back inside the limit.",
        ],
        result:
          "Both controllers apply 5 now, but only the unprotected controller stores an additional 0.3 error·s that can delay later recovery.",
        takeaway:
          "Anti-windup changes hidden controller state, so test what happens after saturation ends—not only the command while it is clamped.",
      },
      handsOn: {
        setup:
          "Use the Day 18 simulation with output range [-1,1], a persistent unreachable setpoint for 30 steps, then a reachable setpoint.",
        steps: [
          "Run with integral enabled and no anti-windup; log requested output, applied output, and integral state.",
          "Mark every saturated step and record the largest integral value.",
          "Change to the reachable setpoint and measure recovery time and overshoot.",
          "Reset and repeat with conditional integration or an explicit integral bound.",
          "Plot both integral states and applied commands on the same time axis.",
          "Write which anti-windup rule you used and one failure it does not solve.",
        ],
        observe:
          "The protected controller usually exits saturation with less stored error, but it still cannot make an impossible physical target reachable.",
        doneWhen:
          "The report shows requested versus applied output, saturation state, integral state, and recovery metrics for both cases.",
      },
      jobConnection: {
        roles: [
          "Robotics Deployment, Integration & Validation Engineer",
          "Robotics Software Engineer — ROS 2 / AMR",
        ],
        workExample:
          "Validate that wheel, lift, or joint controllers expose saturation and recover predictably from blocked motion, low voltage, command limits, and released obstructions.",
        interviewPrompt:
          "A lift stays at full output while blocked, then overshoots badly when released. Explain the logs and anti-windup tests you expect.",
      },
      commonMistakes: [
        {
          mistake: "Clamping the output but hiding the original request.",
          correction:
            "Log requested output, applied output, active limit, and integral state so the cause is diagnosable.",
        },
        {
          mistake: "Assuming output clamping automatically prevents windup.",
          correction:
            "The hidden integral can still grow unless the implementation explicitly limits or corrects it.",
        },
        {
          mistake: "Calling a PID clamp a certified safety function.",
          correction:
            "Use independent risk-based safety mechanisms and hardware boundaries appropriate to the robot.",
        },
      ],
      checkQuestions: [
        {
          question: "What does clamp(11,-5,5) return?",
          answer:
            "`clamp(11,-5,5)` returns `5` because the requested value exceeds the permitted upper bound.",
        },
        {
          question: "Why can windup cause overshoot after an obstruction is removed?",
          answer:
            "The accumulated integral keeps commanding in the old direction after the actuator can move again.",
        },
        {
          question: "What four values make saturation diagnosable?",
          answer:
            "Requested command, applied command, active limit or saturation flag, and integral state; measurement and error add further context.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The shared feedback image cannot show hidden integral state and recovery as clearly as the paired simulation traces.",
      },
    },
    {
      dayId: 21,
      mentalModel:
        "A controller is not “good” because it reached the target once. It is good only for a declared test when its complete response is stable, bounded, accurate, timely, and repeatable.",
      explanation: [
        "Start with a fixed test contract: plant model or mechanism, payload, initial state, setpoint change, sample period, noise and delay, command limits, gains, software version, and pass criteria. Changing any of these while comparing controllers makes the result ambiguous.",
        "A step-response plot should show setpoint, measured output, error, requested command, applied command, and saturation. Rise time describes the initial approach using a declared convention, overshoot measures how far the response exceeds the target, and settling time is when it enters and remains inside a declared tolerance band.",
        "Steady-state error measures the remaining long-term offset. Also report maximum command, time in saturation, oscillation or sign changes, and safety violations. One attractive average can hide rare large failures, so preserve per-trial results and the worst case.",
        "Repeatability requires the exact runnable configuration and multiple fixed trials. A credible report includes successful and failed plots, numeric metric definitions, source data, and an engineering decision such as “reduce Kp,” “add model feedforward,” or “the actuator is undersized.” It never upgrades simulation evidence into a claim of hardware safety.",
      ],
      keyTerms: [
        {
          term: "Rise time",
          meaning: "Time for the response to make its initial rise across a declared fraction of the final change.",
          physicalExample: "A report may define 10–90% rise time for a wheel-speed step.",
        },
        {
          term: "Overshoot",
          meaning: "How far the response exceeds the target, often as a percentage of step size.",
          physicalExample: "A 10° target with a 12° peak has 20% overshoot for a step from zero.",
        },
        {
          term: "Settling time",
          meaning: "Time until the response enters and stays within a declared tolerance band.",
          physicalExample: "The arm stays inside ±0.2° after 3.4 s.",
        },
        {
          term: "Steady-state error",
          meaning: "The remaining error after transient behaviour has ended.",
          physicalExample: "A joint rests 0.1° below its target under gravity.",
        },
        {
          term: "Saturation fraction",
          meaning: "The fraction of trial time for which applied command is at a limit.",
          physicalExample: "0.6 s saturated during a 4 s trial is 15%.",
        },
      ],
      physicalExamples: [
        {
          title: "Two lifts reach the same floor",
          scenario:
            "One lift arrives smoothly in four seconds; another passes the floor, reverses twice, and arrives after ten seconds.",
          lookFor:
            "Final position alone calls both successful, while overshoot, settling time, and command history reveal very different quality.",
        },
        {
          title: "Warehouse rover with changing payload",
          scenario:
            "A speed controller is tested empty and with a loaded tote using the same path and setpoint.",
          lookFor:
            "Report per-condition rise time, tracking error, saturation, and any oscillation rather than combining all runs into one average.",
        },
      ],
      workedExample: {
        title: "Calculate a small controller scorecard",
        setup:
          "A zero-to-10 unit step reaches 9 units at 1.1 s, peaks at 12 units, stays inside 10±0.2 after 3.4 s, finishes at 9.9 units, and is saturated for 0.6 s of a 4.0 s trial.",
        steps: [
          "Declare rise-time convention; here use first time the response reaches 90% of the 10-unit step.",
          "Read rise time as 1.1 s because 90% is 9 units.",
          "Compute percent overshoot: (12-10)/10×100%=20%.",
          "Read settling time as 3.4 s using the declared ±0.2 band.",
          "Compute final steady-state error: 10-9.9=0.1 unit.",
          "Compute saturation fraction: 0.6/4.0×100%=15%.",
          "Compare every metric with written pass limits instead of assigning “good” by appearance.",
        ],
        result:
          "The scorecard is 1.1 s rise time, 20% overshoot, 3.4 s settling time, 0.1 unit final error, and 15% saturation.",
        takeaway:
          "Metric definitions and pass thresholds are part of the test; otherwise the same plot can support conflicting claims.",
      },
      handsOn: {
        setup:
          "Use the bounded simulation from this week and freeze one setpoint, initial condition, sample period, command limit, and 100-step duration.",
        steps: [
          "Write numeric pass criteria for maximum overshoot, settling time, steady-state error, and saturation fraction.",
          "Run the baseline gains three times with exactly the same deterministic conditions.",
          "Run one boundary case with added delay and one with a persistent opposing bias.",
          "Export or copy setpoint, measurement, error, requested command, applied command, and saturation columns.",
          "Calculate the five scorecard metrics with stated definitions.",
          "Include the worst plot, explain its cause using evidence, and choose one next change.",
          "Rerun only that change against the unchanged test contract.",
        ],
        observe:
          "A change that improves rise time may worsen overshoot or saturation; controller quality is a tradeoff constrained by the task.",
        doneWhen:
          "The report is reproducible from its configuration, includes nominal and failure evidence, and ends with a justified engineering decision.",
      },
      jobConnection: {
        roles: [
          "Robotics Deployment, Integration & Validation Engineer",
          "Robotics Software Engineer — ROS 2 / AMR",
        ],
        workExample:
          "Build a regression report that compares controller versions across payload, delay, friction, and saturation cases with fixed acceptance thresholds and raw failure traces.",
        interviewPrompt:
          "What evidence would convince you that a wheel-speed controller is ready for HIL testing, and what would simulation still not prove?",
      },
      commonMistakes: [
        {
          mistake: "Reporting only the final error or one successful run.",
          correction:
            "Include transient metrics, command limits, repeated conditions, failure cases, and per-trial results.",
        },
        {
          mistake: "Using “settled” without a tolerance band.",
          correction:
            "Declare the band and require the response to enter and remain inside it.",
        },
        {
          mistake: "Comparing gain sets while changing payload, delay, or initial condition.",
          correction:
            "Freeze the test contract; change one factor at a time or label a designed test matrix explicitly.",
        },
        {
          mistake: "Calling simulation success proof of safe hardware behaviour.",
          correction:
            "Treat simulation as evidence for the model and implementation, then perform separate protected SIL, HIL, and hardware validation.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must settling-time tolerance be declared?",
          answer:
            "Different bands produce different settling times, so the number is meaningless without its criterion.",
        },
        {
          question: "What does 20% overshoot mean for a zero-to-10 step?",
          answer:
            "The response peaked 2 units above the target, at 12.",
        },
        {
          question: "What does a repeatable simulation report not prove?",
          answer:
            "It does not prove unmodelled hardware, electrical, thermal, contact, timing, or safety behaviour.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "One response-and-metrics visual supports reading overshoot and settling definitions and is distinct from the Day 17 loop diagram.",
      },
    },
  ],
} satisfies ChapterContent;
