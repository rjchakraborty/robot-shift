import type { ChapterContent } from "../chapter-content-types";

const ROLE_HMI = "Robot HMI / Control & Monitoring Engineer";
const ROLE_FLEET = "Robot Fleet Backend / Platform Engineer";
const ROLE_VALIDATION = "Robotics Deployment, Integration & Validation Engineer";
const ROLE_INTEGRATION = "Robotics Application / ROS 2 Integration Engineer";
const ROLE_SOFTWARE = "Robotics Software Engineer — ROS 2 / AMR";
const ROLE_PHYSICAL_AI = "Robot Learning Deployment / Physical AI Integration Engineer";

export const week04Content = {
  week: 4,
  title: "Production C++, Linux, and deterministic timing",
  purpose:
    "Turn familiar software-engineering habits into reliable robot-boundary software: make resource ownership explicit, build small testable components, package them reproducibly, connect them to Linux devices without unsafe shortcuts, measure timing under load, and preserve enough evidence to replay a failure.",
  prerequisites: [
    "Read a short function, loop, class, and test in any programming language; no prior C++ syntax is assumed.",
    "Use a terminal to create a folder and run a command, with all hardware exercises kept unpowered or simulated.",
    "Understand from Week 3 that a control loop has a period, measured input, bounded output, and deadline.",
  ],
  outcomes: [
    "Explain C++ scope, lifetime, RAII, references, raw pointers, unique ownership, and shared ownership without treating smart pointers as decoration.",
    "Design small value types and interfaces that keep units, validity rules, hardware access, and control logic at clear dependency boundaries.",
    "Build a target-based CMake project with a library, executable, tests, warnings, and a checked-in preset.",
    "Diagnose a Linux device or network bring-up problem through processes, device nodes, identities, permissions, stable names, interfaces, addresses, and ports.",
    "Measure loop period, execution time, latency, deadline misses, and jitter; explain threads, locks, priority inversion, and the limits of real-time priority.",
    "Use sanitizers, profiling, structured event records, deterministic replay, and CI as complementary evidence rather than interchangeable badges.",
    "Ship a bounded sensor-to-controller pipeline whose build, normal run, overload, cancellation, device failure, and replay can be reproduced by another engineer.",
  ],
  jobTargets: [
    ROLE_VALIDATION,
    ROLE_INTEGRATION,
    ROLE_SOFTWARE,
    ROLE_HMI,
    ROLE_FLEET,
    ROLE_PHYSICAL_AI,
  ],
  sources: [
    {
      label: "C++ Core Guidelines",
      url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
      useFor:
        "RAII, resource ownership, value semantics, parameter passing, interfaces, error handling, and the rule that smart-pointer parameters should express lifetime semantics.",
    },
    {
      label: "CMake — official tutorial",
      url: "https://cmake.org/cmake/help/latest/guide/tutorial/index.html",
      useFor:
        "Target-based executables and libraries, usage requirements, presets, testing, installation, and finding dependencies.",
    },
    {
      label: "systemd — udev manual",
      url: "https://www.freedesktop.org/software/systemd/man/latest/udev.html",
      useFor:
        "Linux device events, device-node permissions, rule matching, and stable symlinks under /dev.",
    },
    {
      label: "Linux kernel — PREEMPT_RT theory of operation",
      url: "https://docs.kernel.org/core-api/real-time/theory.html",
      useFor:
        "Normal versus real-time scheduling, preemption, threaded interrupts, rtmutexes, and priority inheritance.",
    },
    {
      label: "Clang — sanitizers documentation",
      url: "https://clang.llvm.org/docs/",
      useFor:
        "Official AddressSanitizer, UndefinedBehaviorSanitizer, and ThreadSanitizer guidance, including detected defects, instrumentation, limits, and security considerations.",
    },
  ],
  days: [
    {
      dayId: 22,
      mentalModel:
        "Treat every scarce thing as a borrowed workshop tool: one named owner is responsible for returning it, and the return happens automatically when that owner's working area ends.",
      explanation: [
        "A C++ object has a lifetime: a moment when it begins to exist and a moment when it stops existing. A local object normally dies when execution leaves its surrounding braces, called its scope. Its destructor runs at that boundary. RAII uses this ordinary language rule to manage a resource: acquire the resource while constructing an owning object, then release it in the destructor. The resource could be memory, a file, a serial port, a mutex, or a camera handle. Cleanup still runs when a function returns early or an exception crosses the scope, so correctness does not depend on remembering every manual close path.",
        "Ownership answers who must keep an object alive and who must release its resource. A plain local value has a simple owner: its scope. A `std::unique_ptr<T>` is an owning handle that cannot be copied; moving it transfers the one ownership responsibility. A `std::shared_ptr<T>` counts cooperating owners and destroys the object only when the last owner leaves, which adds cost and can leak through ownership cycles. Choose shared ownership only when the design truly has several independent lifetime owners, not because it feels safer than deciding.",
        "A reference such as `Sensor&` is a temporary alias for an existing object and normally means the called function does not take ownership. A `const Sensor&` also promises not to modify the sensor through that reference. A raw pointer such as `Sensor*` can express a non-owning optional relationship when `nullptr` has a meaning, but a pointer alone does not tell the reader who owns the object. Passing `unique_ptr` or `shared_ptr` into every helper falsely suggests ownership transfer or sharing; a helper that merely uses a sensor should usually receive a reference or non-owning pointer.",
        "Robot drivers make lifetime mistakes physical. If a serial-port owner is copied accidentally, two objects may try to close the same handle. If a background callback keeps a dangling pointer after the driver dies, it may read freed memory while commands are active. If shutdown waits forever for a worker, the actuator may never receive its final quiet command. Design the stop sequence with the resource lifetime: request the defined safe output and stop, wake blocked work, let bounded shutdown logic deliver or confirm that safe transition, join the worker, verify the required quiet state, and only then let the owning handle close.",
      ],
      keyTerms: [
        {
          term: "Scope",
          meaning:
            "The region of code in which a name is usable; leaving a local object's scope normally ends that object's lifetime.",
          physicalExample:
            "A serial-session object created inside one test case is destroyed when that case finishes.",
        },
        {
          term: "RAII",
          meaning:
            "A C++ pattern that ties acquiring and releasing a resource to the construction and destruction of an owning object.",
          physicalExample:
            "A port wrapper opens `/dev/robot_sensor` when constructed and closes it in its destructor.",
        },
        {
          term: "Ownership",
          meaning:
            "The responsibility for keeping an object alive and eventually releasing the resource it controls.",
          physicalExample:
            "The driver object owns the file descriptor; a parser only borrows bytes read from it.",
        },
        {
          term: "Reference",
          meaning:
            "A non-owning alias to an existing object; `const` can forbid modification through that alias.",
          physicalExample:
            "A filter receives `const Sample&` to inspect a sample without copying it or controlling its lifetime.",
        },
        {
          term: "Smart pointer",
          meaning:
            "An owning standard-library handle whose type states unique or shared lifetime responsibility.",
          physicalExample:
            "A factory returns `std::unique_ptr<Camera>` so the caller becomes the camera owner's single successor.",
        },
      ],
      physicalExamples: [
        {
          title: "Spring-loaded soldering-iron stand",
          scenario:
            "Taking the iron from its holder begins a responsibility; returning it ends that responsibility even when the original task is abandoned halfway.",
          lookFor:
            "RAII is stronger than a reminder note because cleanup is attached to the holder's lifetime, including early exits.",
        },
        {
          title: "One motor port, two software owners",
          scenario:
            "Two independently copied driver handles both believe they may close or reconfigure the same motor-controller connection.",
          lookFor:
            "Double close, commands after close, and disagreement over shutdown order reveal that the resource never had one clear owner.",
        },
      ],
      workedExample: {
        title: "Trace ownership through a sensor read",
        setup:
          "A function creates a port owner, constructs a sensor driver that borrows the port, reads one sample, and returns early when the checksum is bad.",
        steps: [
          "Mark the port wrapper as the owner because it acquired the operating-system handle.",
          "Mark the driver reference as a borrower; it may use the port but must not outlive or close it.",
          "Place the wrapper before the borrowing driver so destruction occurs in reverse order: driver first, then port.",
          "Follow the bad-checksum branch and note that returning early still leaves both scopes normally.",
          "Run the destruction order: the driver stops using the port, then the wrapper closes the handle exactly once.",
          "Ask what changes if a worker thread borrows the driver: shutdown must stop and join that worker before either borrowed object dies.",
        ],
        result:
          "The error path releases the handle once, and every borrower ends before the resource owner.",
        takeaway:
          "Correct lifetime is a graph of owners and borrowers, not a choice between raw and smart pointer spellings.",
      },
      handsOn: {
        setup:
          "Use a local C++ compiler and a harmless fake `Port` class that only prints `open`, `read`, and `close`; do not connect powered hardware.",
        steps: [
          "Write `Port` so its constructor prints `open` and its destructor prints `close`.",
          "Delete its copy constructor and copy assignment so one port object cannot be accidentally copied.",
          "Write a `read_once(Port&)` function that borrows the existing port and returns early on a fake invalid sample.",
          "Create the owner as a local value, call `read_once`, and verify that `close` prints once after the early return.",
          "Move a `std::unique_ptr<Port>` between two clearly named owners and confirm the moved-from handle is empty.",
          "Add a short ownership note stating who owns the port, who borrows it, and the required worker-stop order.",
        ],
        observe:
          "Construction and destruction messages make lifetime visible; moving transfers ownership, while borrowing leaves the original owner responsible.",
        doneWhen:
          "Normal and early-return runs both close exactly once, copying the owner fails to compile, and your note names every borrower that must stop before destruction.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Review a C++ camera or serial driver so handles, buffers, callbacks, and worker threads have explicit owners and a bounded safe shutdown order.",
        interviewPrompt:
          "A callback sometimes runs after its device driver is destroyed. Draw the owner-and-borrower lifetimes, explain why a smart pointer alone may not repair the design, and propose a testable shutdown sequence.",
      },
      commonMistakes: [
        {
          mistake: "Using `shared_ptr` everywhere because several functions touch an object.",
          correction:
            "Touching is borrowing, not owning. Use references for required borrowers and reserve shared ownership for genuinely independent lifetime owners.",
        },
        {
          mistake: "Calling RAII automatic memory management.",
          correction:
            "RAII manages any resource with a deterministic release action, including files, locks, sockets, and device handles—not only heap memory.",
        },
        {
          mistake: "Closing the device first and then asking the worker thread to stop.",
          correction:
            "Request stop, wake and join work that borrows the device, establish the required safe state, and only then destroy the device owner.",
        },
      ],
      checkQuestions: [
        {
          question: "Why does `read_sensor(const Sensor&)` usually not need a smart-pointer parameter?",
          answer:
            "It only borrows an existing sensor for the call and does not transfer or share lifetime ownership; the const reference states that narrower contract.",
        },
        {
          question: "What happens to a correctly designed RAII port wrapper when a function returns early?",
          answer:
            "Its destructor runs as the local scope is left, so the owned handle is released without a separate close on that branch.",
        },
        {
          question: "What must happen before an object dies if a worker thread holds a reference to it?",
          answer:
            "The worker must be requested to stop, unblocked if necessary, and joined so it can no longer use the borrowed object.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "An ownership-and-borrowing lifetime diagram makes destruction order and the use-after-destruction failure easier to see than prose alone.",
      },
    },
    {
      dayId: 23,
      mentalModel:
        "Build robot software from labelled containers and narrow plugs: each value carries one meaning, and each component exposes only the connection its neighbour truly needs.",
      explanation: [
        "A value type is a small object whose contents fully describe its meaning. A `TemperatureCelsius`, `Timestamp`, or `WheelVelocity` can be copied, compared, tested, and passed without a hidden device connection. This is safer than moving loose `double` values through the system, because metres per second, radians per second, and raw encoder counts should not be silently interchangeable. A constructor or factory can enforce an invariant such as finite numbers and non-negative timestamps, so invalid states are rejected near their source.",
        "Separate calculation from effects. A filter that accepts a sample value and returns a filtered value is easy to test with a table of inputs. A serial adapter that reads bytes from Linux has an effect and may fail for timing, permission, or disconnection reasons. Put the effect behind a narrow interface, translate its result into a value, then let ordinary functions perform the calculation. This arrangement lets tests supply a recorded sensor without pretending that a fake serial port proves real hardware works.",
        "An interface is a contract about operations and meaning, not simply a class containing virtual methods. A useful `SampleSource` contract says what timestamp clock it uses, which units it returns, what end-of-stream means, and how cancellation behaves. The control pipeline should depend on that contract, while a Linux serial source, a replay file, and a test source implement it. Dependency direction then points from policy toward an abstraction and from hardware-specific code toward the same boundary; high-level control rules do not import device details.",
        "Keep boundaries small enough to reason about. A single `RobotManager` interface with fifty methods couples unrelated timing, storage, UI, and motor concerns. Prefer a few operations that match one responsibility, return explicit results, and make error states visible. In C++, use `const` for data that should not change, values when a copy is independent, references for required borrowers, and an explicit result type or exception policy agreed by the component. The goal is not maximum class count; it is preventing a change in one device driver from quietly changing control meaning elsewhere.",
      ],
      keyTerms: [
        {
          term: "Value type",
          meaning:
            "A type whose stored contents describe the complete value, without hidden identity or ownership of an external device.",
          physicalExample:
            "A timestamped wheel-speed sample contains time, speed, and validity, and remains meaningful after the sensor call ends.",
        },
        {
          term: "Invariant",
          meaning:
            "A rule that must remain true for every valid object of a type.",
          physicalExample:
            "A normalized duty-cycle command remains between -1.0 and +1.0.",
        },
        {
          term: "Interface",
          meaning:
            "A narrow contract describing available operations, data meaning, errors, and lifetime expectations.",
          physicalExample:
            "A sample source promises timestamped speed values and a bounded cancellation path.",
        },
        {
          term: "Dependency boundary",
          meaning:
            "A deliberate seam where one component relies on a stable contract rather than another component's internal details.",
          physicalExample:
            "The controller depends on `SampleSource`, not on USB identifiers or serial read calls.",
        },
        {
          term: "Pure calculation",
          meaning:
            "Work whose output depends only on its input values and which does not change external state.",
          physicalExample:
            "Clamping a requested wheel velocity to a declared safe range.",
        },
      ],
      physicalExamples: [
        {
          title: "Labelled measuring cups",
          scenario:
            "Two cups both hold the number 250, but one means millilitres and the other could mean grams; the label prevents a plausible-looking substitution.",
          lookFor:
            "A domain value type gives a number the same protection by carrying its unit and validity rule.",
        },
        {
          title: "Replaceable battery connector",
          scenario:
            "A tool can accept compatible battery packs because the connector's voltage, shape, polarity, and limits form a contract.",
          lookFor:
            "Matching only the physical shape is not enough, just as matching a C++ method name without units and error meaning is not a complete interface.",
        },
      ],
      workedExample: {
        title: "Split a mixed sensor-controller function",
        setup:
          "One function opens a port, parses encoder bytes, converts counts to rad/s, filters the value, computes a command, writes the motor, and prints an error.",
        steps: [
          "Circle external effects: open, read, write, clock access, and logging.",
          "Define value types for raw packet, timestamped wheel velocity in rad/s, and bounded motor command.",
          "Define a narrow source contract that returns a timestamped sample or an explicit read outcome.",
          "Move parse, unit conversion, filtering, and command calculation into functions that consume and return values.",
          "Define a sink contract whose command range, timeout, cancellation, and failure result are explicit.",
          "Make the top-level pipeline compose the source, calculations, sink, and event recorder without letting calculation code access the port.",
        ],
        result:
          "Recorded samples can exercise the real calculation path, while hardware adapters remain isolated and can be tested separately at the integration boundary.",
        takeaway:
          "Good dependency boundaries separate different reasons for failure while keeping the actual production logic in the test.",
      },
      handsOn: {
        setup:
          "Create a small C++ program using only standard-library types; the input source is a fixed vector of timestamped encoder counts.",
        steps: [
          "Define `EncoderSample` and `WheelVelocity` structs with fields whose names and comments state units.",
          "Write one conversion function that receives a const sample reference and returns a velocity value.",
          "Reject a zero or negative time interval with an explicit result instead of dividing and continuing.",
          "Define a minimal `SampleSource` with one read operation and implement it with the fixed vector.",
          "Run the same conversion tests directly and through the source boundary, including wraparound or invalid-time cases.",
          "Write a dependency note listing which file may know about hardware, which may know about units, and which owns the control rule.",
        ],
        observe:
          "The numeric logic remains testable without a device, while invalid input and unit meaning are visible at type and boundary names.",
        doneWhen:
          "The compiler prevents at least one accidental type substitution, invalid time is handled explicitly, and the control calculation contains no file, network, or device calls.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_SOFTWARE, ROLE_PHYSICAL_AI],
        workExample:
          "Define typed observation, command, and health boundaries so a live sensor, recorded dataset, simulator, or learned policy can connect without changing units or cancellation meaning.",
        interviewPrompt:
          "You inherit one function that reads a camera, runs inference, and commands a robot. Show where you would place value types and interfaces, and explain which tests each boundary enables without hiding integration risk.",
      },
      commonMistakes: [
        {
          mistake: "Using `double` for every physical quantity because the mathematical storage is the same.",
          correction:
            "Use names or domain types that preserve unit, frame, clock, range, and validity so incompatible values cannot pass unnoticed.",
        },
        {
          mistake: "Calling a mock-hardware unit test an integration test.",
          correction:
            "The mock can test policy against the contract; separately test the real adapter, permissions, timing, protocol, and hardware boundary.",
        },
        {
          mistake: "Creating one large interface to make every implementation interchangeable.",
          correction:
            "Split contracts by responsibility and consumer need; broad interfaces increase coupling and make substitutions dishonest.",
        },
      ],
      checkQuestions: [
        {
          question: "Why is `WheelVelocity{2.0}` safer than an unexplained `double` value of 2.0?",
          answer:
            "The domain type can carry the quantity's meaning, unit, validity rule, and allowed operations instead of relying on every caller to remember them.",
        },
        {
          question: "Which part should know that a sensor is connected at `/dev/robot_encoder`?",
          answer:
            "The Linux or hardware adapter should know; filtering and control policy should depend only on the declared sample contract.",
        },
        {
          question: "What does replacing a hardware source with replay data prove?",
          answer:
            "It can reproduce and test downstream parsing or policy behavior for those samples, but it does not prove the live device, permissions, transport, or timing works.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The source–value–policy–sink boundary is short enough to understand from the worked decomposition and code exercise without another diagram.",
      },
    },
    {
      dayId: 24,
      mentalModel:
        "A build system is a labelled assembly plan: targets are the finished parts, dependencies are the required subassemblies, and each requirement travels only to the parts that actually need it.",
      explanation: [
        "Compiling turns one source file into an object file; linking combines object files and libraries into an executable or shared library. A robot repository normally has several such products: a reusable control library, a hardware adapter, an executable, and tests. CMake describes these products as targets. `add_library` and `add_executable` create named targets, while `target_link_libraries` connects them. Think in targets rather than global compiler flags, because a target is the unit that owns its source files, requirements, and dependencies.",
        "Usage requirements say what a target and its consumers need. A `PRIVATE` include directory or definition is used only while building that target. A `PUBLIC` requirement is needed by the target and by consumers that link it. An `INTERFACE` requirement is for consumers only, often because it appears in public headers. These words do not control symbol visibility and they are not decoration. Choosing the wrong scope can make a build pass accidentally on one machine because an unrelated global setting leaked across the project.",
        "A reproducible build begins with a declared toolchain and configuration, not with deleting a build folder until an error disappears. State the minimum CMake version, compiler family and supported range, C++ language standard, dependency versions, build type, and important options. A checked-in `CMakePresets.json` can give developers and CI the same named configure and build settings, while personal paths or secrets stay in `CMakeUserPresets.json` and out of version control. Pinning everything does not guarantee byte-identical binaries across all operating systems, but it makes the input configuration reviewable and repeatable.",
        "Tests should be first-class targets. Build production code once as a library, link the executable and test executable to that same library, and register tests with CTest. Enable strict warnings for code you own, but avoid forcing those flags blindly onto third-party dependencies. A clean build must start from an empty build directory and succeed using documented commands. If another engineer needs an undeclared environment variable, an include path from your laptop, or a hand-edited generated file, the build recipe is incomplete.",
      ],
      keyTerms: [
        {
          term: "Compilation",
          meaning:
            "Translation of a source file into an object file for a particular compiler and configuration.",
          physicalExample:
            "Each control or driver source file becomes one intermediate part before final assembly.",
        },
        {
          term: "Linking",
          meaning:
            "Combining object files and libraries while resolving referenced symbols into a final program or library.",
          physicalExample:
            "The pipeline executable links the controller library and operating-system threading library.",
        },
        {
          term: "CMake target",
          meaning:
            "A named build product, such as a library, executable, or test, with its own sources and usage requirements.",
          physicalExample:
            "`robot_control` can be a library used by both `robot_pipeline` and `robot_control_tests`.",
        },
        {
          term: "Usage requirement",
          meaning:
            "A compile, include, feature, definition, or link requirement attached to a target and propagated according to its scope.",
          physicalExample:
            "Consumers need the public header directory of the controller library but not its private implementation directory.",
        },
        {
          term: "Build preset",
          meaning:
            "A named, shareable set of CMake configure, build, or test settings.",
          physicalExample:
            "Developers and CI both use a checked-in `dev-sanitize` preset instead of retyping different flags.",
        },
      ],
      physicalExamples: [
        {
          title: "Subassemblies in a robot kit",
          scenario:
            "A wheel module contains its private gears but exposes mounting holes and a shaft contract to the chassis that consumes it.",
          lookFor:
            "Private implementation needs stay inside the module; public connection requirements travel to its consumer like target usage requirements.",
        },
        {
          title: "Recipe with a mystery ingredient",
          scenario:
            "A second cook follows a recipe but fails because the first cook silently used a spice already sitting on one kitchen shelf.",
          lookFor:
            "A build that relies on an undeclared local package or path is not reproducible even if it succeeds repeatedly for its author.",
        },
      ],
      workedExample: {
        title: "Design the target graph before writing CMake",
        setup:
          "The project contains a pure filter, a Linux serial adapter, one command-line pipeline, and filter tests.",
        steps: [
          "Create `robot_filter` as a library containing the value types and filter calculation.",
          "Create `linux_serial` as a separate library that links only the operating-system dependencies it needs.",
          "Create `robot_pipeline` as an executable that links both libraries and owns composition and shutdown.",
          "Create `robot_filter_tests` as an executable linked to the same `robot_filter` production target.",
          "Mark each header path and compile feature PRIVATE, PUBLIC, or INTERFACE according to whether consumers need it.",
          "Add a checked-in preset and run configure, build, and CTest from a new empty build directory.",
        ],
        result:
          "The dependency graph states which products exist, tests reuse production code, and an unrelated target does not inherit serial-driver settings.",
        takeaway:
          "A modern CMake file models products and their contracts; it is not a shell script made of global flags.",
      },
      handsOn: {
        setup:
          "Make a three-file harmless project: one small moving-average library, one console executable, and one test executable.",
        steps: [
          "Write the library header and source with no terminal input, device access, or global state.",
          "Create a CMake library target and declare the required C++ standard with `target_compile_features`.",
          "Create the console target and link it to the library target.",
          "Create the test target, link the same library, enable testing, and register the test with CTest.",
          "Add a project preset that selects an out-of-source build directory and a debug configuration.",
          "Delete only the generated build directory, then configure, build, and test from scratch using the preset.",
          "Save the tool versions and exact commands in a short build note.",
        ],
        observe:
          "A missing source, include path, requirement, or dependency becomes visible when the clean build cannot borrow state from an older build tree.",
        doneWhen:
          "A fresh clone-equivalent folder can build the executable and pass the registered test using the documented preset and no hand-edited generated files.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_VALIDATION],
        workExample:
          "Package control logic, hardware adapters, executables, and tests as reviewable CMake targets that build in both developer and CI environments.",
        interviewPrompt:
          "A CMake project builds on one laptop but not in CI. Explain how you would inspect target requirements, undeclared dependencies, presets, compiler versions, and clean-build evidence before adding flags.",
      },
      commonMistakes: [
        {
          mistake: "Adding include directories and compiler flags globally until every target builds.",
          correction:
            "Attach the smallest correct requirements to the target that owns them and propagate only what consumers truly need.",
        },
        {
          mistake: "Compiling a separate copy of production source directly into tests.",
          correction:
            "Build production logic as a library target and link both the application and tests to that same target.",
        },
        {
          mistake: "Claiming reproducibility because rebuilding twice on the same dirty machine succeeds.",
          correction:
            "Verify from a clean build tree with declared tools, dependencies, options, presets, and commands; distinguish repeatable configuration from byte-identical output.",
        },
      ],
      checkQuestions: [
        {
          question: "When should a library include directory be `PUBLIC`?",
          answer:
            "When the library needs it while building and consumers also need it to compile against the library's public headers.",
        },
        {
          question: "Why should a test link the production library target?",
          answer:
            "It exercises the same compiled production code and declared requirements instead of a second, potentially different test-only build of the sources.",
        },
        {
          question: "What belongs in `CMakePresets.json` rather than `CMakeUserPresets.json`?",
          answer:
            "Project-wide shared configurations suitable for version control belong in `CMakePresets.json`; personal paths and local-only settings belong in the user file.",
        },
      ],
      visual: {
        show: true,
        mode: "concept",
        reason:
          "A target dependency graph materially clarifies which usage requirements propagate from libraries to the executable and tests.",
      },
    },
    {
      dayId: 25,
      mentalModel:
        "Linux is the building manager between your program and the hardware: it knows which process is asking, which doorway represents the device, what permissions that doorway has, and where network packets must go.",
      explanation: [
        "A running program is a process with an identity, open resources, memory, environment, and process ID. Multiple processes may try to use the same serial or camera device, so first discover what is running and who owns the handle instead of restarting randomly. Linux exposes many devices as special files under `/dev`. Opening `/dev/ttyUSB0` is not reading an ordinary text file; it asks a kernel driver to communicate with a device. A failure can therefore come from absence, driver binding, a competing process, permissions, configuration, cabling, power, or the device itself.",
        "Linux checks the user and group of the process against the owner, group, and mode of the device node. Running the whole robot program with `sudo` may make one permission symptom disappear, but it gives broad power, hides the deployment rule, changes the environment, and can create root-owned files. Prefer the narrow permission the device needs. udev receives kernel device events and matches rules against attributes. A rule can assign an appropriate group and create a stable symlink such as `/dev/robot_lidar`, avoiding the mistake of assuming the first discovered USB device will always be `ttyUSB0`.",
        "A network path has layers that must be checked separately. An interface must be up; each machine needs the intended address and subnet or a route; name resolution may map a hostname; a server process must listen on the expected transport and port; firewalls must permit the traffic; and the application protocols must agree. A successful ping only demonstrates one kind of reachability when ICMP is allowed. It does not prove that a TCP server is listening, that UDP multicast crosses the network, that the process has permission, or that request bytes have the expected format.",
        "Bring-up should produce a small evidence chain. Record the exact physical identifier, kernel or udev attributes, stable device path, process user and groups, device-node permissions, process holding the device, interface and address, intended endpoint, and one application-level exchange. Make one change at a time and remove temporary broad permissions. For powered equipment, keep actuators disabled while diagnosing communication and follow the hardware's isolation procedure; finding a device is not permission to move it.",
      ],
      keyTerms: [
        {
          term: "Process",
          meaning:
            "A running program instance with its own identity, resources, address space, and process ID.",
          physicalExample:
            "A driver process holds a serial device open while a separate monitoring process reads its published health.",
        },
        {
          term: "Device node",
          meaning:
            "A special file, usually under `/dev`, through which a process communicates with a kernel-managed device.",
          physicalExample:
            "`/dev/ttyUSB0` can represent a USB-to-serial adapter, not a stored file of bytes.",
        },
        {
          term: "udev rule",
          meaning:
            "A rule matched against device-event attributes that can set metadata, permissions, or stable symlinks.",
          physicalExample:
            "A vendor-and-serial-specific rule creates `/dev/robot_encoder` for the intended adapter.",
        },
        {
          term: "Network interface",
          meaning:
            "A software-visible connection point, such as Ethernet, Wi-Fi, or loopback, that carries network traffic.",
          physicalExample:
            "The robot's Ethernet interface has a static address on the control subnet.",
        },
        {
          term: "Port",
          meaning:
            "A transport-level number used with an address and protocol to direct traffic to a listening application.",
          physicalExample:
            "A telemetry server listens on one TCP port while discovery may use a separate UDP multicast flow.",
        },
      ],
      physicalExamples: [
        {
          title: "Two identical USB adapters swap order",
          scenario:
            "After a reboot, the lidar adapter appears second and receives `ttyUSB1`, while software still opens `ttyUSB0` and talks to another board.",
          lookFor:
            "Match stable physical attributes and create a meaningful symlink instead of encoding discovery order.",
        },
        {
          title: "Reachable robot, closed application door",
          scenario:
            "The robot answers ping, but the telemetry client times out because the service listens only on loopback or on a different port.",
          lookFor:
            "Interface reachability and application reachability are different claims that need different evidence.",
        },
      ],
      workedExample: {
        title: "Diagnose a serial sensor that says permission denied",
        setup:
          "The device exists at `/dev/ttyUSB0`; the application works under `sudo` but fails as the normal robot-service user.",
        steps: [
          "Keep actuators disabled and record the exact error, service identity, device path, and connection state.",
          "Inspect device ownership and mode, then list the service user's group membership instead of changing permissions immediately.",
          "Inspect udev attributes that uniquely identify the intended adapter, including vendor, product, and serial where available.",
          "Draft a narrow rule that assigns the intended access group and creates `/dev/robot_sensor`; avoid world-writable mode.",
          "Reload and trigger rules or reconnect the unpowered test device, then verify the symlink and permissions.",
          "Run as the real service identity, prove one valid application-level read, and verify a wrong user remains denied.",
        ],
        result:
          "The deployed identity accesses only the intended device through a stable name without broad root privileges.",
        takeaway:
          "A permission fix is complete only when identity, device matching, least privilege, and the actual protocol exchange are all verified.",
      },
      handsOn: {
        setup:
          "Use a spare unpowered USB serial adapter, or simulate the investigation with an ordinary file and a documented mock attribute list; do not loosen global machine permissions.",
        steps: [
          "Record the current user, groups, process list, and the chosen path's owner, group, and mode.",
          "If a real spare device is present, inspect its udev properties; otherwise write the vendor, product, and serial fields your rule would require.",
          "Draft a rule that creates a semantic symlink and assigns a specific access group, but do not install it machine-wide for the simulation.",
          "Draw the network path from robot process through interface, address, transport, port, and client process.",
          "For a loopback-only toy server, verify separately that the process is listening and that one application request receives the expected reply.",
          "Write a symptom table for missing device, permission denied, busy device, no route, connection refused, timeout, and bad application response.",
        ],
        observe:
          "Similar user-visible failures occur at different layers, while each inspection answers only one bounded question.",
        doneWhen:
          "Your evidence identifies the process identity, stable device rule, least-privilege decision, network endpoint, and one application-level success without using a world-writable device or permanent root execution.",
      },
      jobConnection: {
        roles: [ROLE_INTEGRATION, ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_FLEET],
        workExample:
          "Commission a USB sensor and an edge-to-fleet network service using stable naming, least privilege, layer-by-layer diagnostics, and a repeatable bring-up record.",
        interviewPrompt:
          "A sensor works with sudo and the robot responds to ping, but the deployed service gets no data. Give an evidence-first diagnosis that separates identity, device ownership, competing processes, interface, port, and protocol.",
      },
      commonMistakes: [
        {
          mistake: "Making the device world-writable or running every node as root.",
          correction:
            "Match the intended device precisely and grant a dedicated service identity only the required group or rule-based access.",
        },
        {
          mistake: "Hard-coding `/dev/ttyUSB0` as the physical sensor identity.",
          correction:
            "Discovery order can change; use stable attributes and a semantic udev symlink for the intended device.",
        },
        {
          mistake: "Treating a successful ping as proof that the robotics application communicates.",
          correction:
            "Also verify interface binding, transport, port, firewall, listener, protocol compatibility, and one valid application exchange.",
        },
      ],
      checkQuestions: [
        {
          question: "Why can a program work under sudo yet still be incorrectly deployed?",
          answer:
            "Root bypasses the intended least-privilege identity and may hide a missing group or udev rule while changing environment and file ownership.",
        },
        {
          question: "What makes `/dev/robot_lidar` safer than assuming `/dev/ttyUSB0`?",
          answer:
            "A correctly written udev rule can tie the semantic name to stable device attributes instead of changeable discovery order.",
        },
        {
          question: "What does connection refused usually tell you that a timeout does not?",
          answer:
            "It usually indicates the destination was reached but no service accepted that endpoint, while a timeout may occur earlier or be caused by filtering, routing, loss, or a silent application.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The layer-by-layer symptom table and concrete bring-up trace are more useful here than another generic system-flow diagram.",
      },
    },
    {
      dayId: 26,
      mentalModel:
        "A control loop is a bus with a timetable: finishing eventually is not enough—the useful result must arrive before its physical deadline, even while other work competes for the road.",
      explanation: [
        "Frequency says how many loop cycles are requested each second. Period is the time between ideal cycle starts and equals one divided by frequency. A 100 Hz loop has a 0.01 s, or 10 ms, period. Execution time is how long that cycle's work consumes; end-to-end latency is the age from a physical event or sample timestamp to the resulting action or observation. The deadline is the latest useful completion time. These values are related but not identical: work taking 3 ms can still act on a sample that waited 40 ms in a queue.",
        "Jitter is variation around expected timing. Start-time jitter compares actual starts with the planned schedule; execution-time jitter compares how long repeated work takes. Report a distribution or at least minimum, median, high percentile, maximum, and miss count under a declared load. An average of 4 ms does not protect a 10 ms deadline if occasional cycles take 18 ms. Use a monotonic clock for intervals because wall-clock time may jump when synchronized or manually changed.",
        "Threads let pieces of one process make progress concurrently and share memory, but they do not promise simultaneous execution or deterministic order. A mutex protects an invariant by allowing one thread at a time into a critical section. Keep that section bounded and do not perform unknown blocking I/O while holding the lock. A queue between sensor and controller must also be bounded: if input arrives faster than processing, decide whether to reject, drop oldest for freshness, drop newest for continuity, or enter a safe state. Letting memory grow is not a timing policy.",
        "Real-time scheduling means bounded response is the design goal; it does not mean simply fast. On Linux, ordinary tasks commonly use fair scheduling, while real-time policies can let higher-priority runnable work preempt lower-priority work. Priority inversion occurs when a high-priority thread needs a lock held by a lower-priority thread and is indirectly delayed by medium-priority work. Priority inheritance can temporarily raise the lock owner's priority, but it cannot repair unbounded work, page faults, bad drivers, blocking calls, overload, or incorrect deadlines. First bound the design, then measure on the target under representative load.",
      ],
      keyTerms: [
        {
          term: "Period",
          meaning:
            "The intended time between cycle starts; for frequency f, period T equals 1/f.",
          physicalExample:
            "A 50 Hz safety monitor starts a new check every 20 ms.",
        },
        {
          term: "Deadline",
          meaning:
            "The latest time by which work must complete to remain useful for its physical purpose.",
          physicalExample:
            "A wheel command must be refreshed before the watchdog's 100 ms expiry.",
        },
        {
          term: "Jitter",
          meaning:
            "Variation of observed start, completion, or latency values around the expected timing.",
          physicalExample:
            "A nominal 10 ms loop begins after gaps of 9.7, 10.1, and 12.4 ms.",
        },
        {
          term: "Mutex",
          meaning:
            "A synchronization object that permits one owner at a time to protect a shared invariant.",
          physicalExample:
            "The state estimator and monitor do not modify one shared status record at the same time.",
        },
        {
          term: "Priority inversion",
          meaning:
            "A higher-priority task is blocked by a resource held by lower-priority work, potentially extended by medium-priority work.",
          physicalExample:
            "A control thread waits for a diagnostics thread's lock while an unrelated worker repeatedly preempts the lock holder.",
        },
      ],
      physicalExamples: [
        {
          title: "Conveyor camera deadline",
          scenario:
            "A camera identifies an item correctly, but the result reaches the diverter after the item has already passed.",
          lookFor:
            "Accuracy is irrelevant for that item once capture, queue, inference, and command latency exceed the physical travel deadline.",
        },
        {
          title: "Three workers and one calibration notebook",
          scenario:
            "An urgent safety worker needs a notebook held by a low-priority recorder, while a medium-priority reporter keeps interrupting the recorder.",
          lookFor:
            "The urgent worker is indirectly delayed; priority inheritance helps the recorder finish and release the shared notebook.",
        },
      ],
      workedExample: {
        title: "Compute timing evidence for a 100 Hz loop",
        setup:
          "Ideal starts are 0, 10, 20, 30, and 40 ms. Actual starts are 0.0, 10.4, 19.7, 31.2, and 40.1 ms. Execution times are 4, 5, 12, 6, and 4 ms.",
        steps: [
          "Convert frequency to period: T=1/100 s=0.01 s=10 ms.",
          "Subtract each ideal start from its actual start to get start jitter: 0.0, +0.4, -0.3, +1.2, and +0.1 ms.",
          "Compare each execution time with the 10 ms cycle budget: the 12 ms cycle exceeds that budget by 2 ms.",
          "For that cycle, compute completion at 19.7+12=31.7 ms and compare it with the absolute 30 ms deadline, so it finishes 1.7 ms late.",
          "Count deadline misses: 1 miss among 5 observed cycles, or 20% in this tiny sample.",
          "Report the maximum observed start jitter magnitude as 1.2 ms and maximum execution time as 12 ms.",
          "State the missing evidence: five unloaded samples cannot establish a production timing bound; run long tests under declared CPU, I/O, thermal, and network load.",
        ],
        result:
          "The mean-looking loop is not acceptable for a strict 10 ms deadline because at least one measured execution exceeds the budget.",
        takeaway:
          "A rate request is not timing proof; timestamps, tail values, miss counts, load, and target configuration are the proof.",
      },
      handsOn: {
        setup:
          "Write a harmless C++ timing program with a periodic worker and a background load thread; do not request real-time privileges or change machine-wide scheduling settings.",
        steps: [
          "Use a monotonic clock and schedule ideal starts at a 20 ms period.",
          "At each cycle, record ideal start, actual start, execution completion, and a cycle sequence number.",
          "Add bounded synthetic work and make every twentieth cycle deliberately longer than the budget.",
          "Run a background thread that performs bounded CPU work without sharing the timing log during the measured section.",
          "Compute start jitter, execution time, maximum, a high percentile if enough samples exist, and deadline-miss count.",
          "Add a bounded stop flag or stop token, request cancellation, join both threads, and measure shutdown time.",
          "Repeat with and without background load and save both configurations beside the results.",
        ],
        observe:
          "The requested sleep period, actual start schedule, execution budget, and cancellation time differ; load and deliberate outliers appear in tail metrics.",
        doneWhen:
          "At least 500 cycles produce machine-readable timing records, the planted overruns are counted, shutdown is bounded, and the report states clock, load, period, and hardware used.",
      },
      jobConnection: {
        roles: [ROLE_SOFTWARE, ROLE_VALIDATION, ROLE_INTEGRATION, ROLE_HMI],
        workExample:
          "Measure a driver or control callback under representative load, bound its queue and critical sections, and expose stale data and deadline misses to validation and operator tooling.",
        interviewPrompt:
          "A 100 Hz loop averages 3 ms but still oscillates under load. Explain which timestamps and tail metrics you need, how queues and locks can add latency, and why increasing thread priority is not the first complete fix.",
      },
      commonMistakes: [
        {
          mistake: "Calling a loop real-time because its average execution is below the period.",
          correction:
            "Check end-to-end deadlines, tail and maximum timing, miss count, queue age, and representative load on the target.",
        },
        {
          mistake: "Using repeated relative sleeps as the timing schedule.",
          correction:
            "Schedule against absolute monotonic deadlines so work time and wake-up error do not silently accumulate as drift.",
        },
        {
          mistake: "Giving the control thread the highest priority before bounding its work.",
          correction:
            "Remove unbounded blocking, constrain queues and locks, define cancellation, then measure; an unbounded high-priority loop can starve the whole system.",
        },
      ],
      checkQuestions: [
        {
          question: "How much time is available per cycle at 50 Hz?",
          answer:
            "`T=1/f=1/50` s, so the ideal interval between cycle starts is `0.02` s, or `20` ms.",
        },
        {
          question: "Why can 3 ms execution still produce a 40 ms-old command?",
          answer:
            "The sample may have waited in a queue or earlier pipeline stages; execution time measures only one section, while end-to-end latency includes waiting and upstream work.",
        },
        {
          question: "What does priority inheritance do during priority inversion?",
          answer:
            "It temporarily gives the lock holder the blocked higher-priority task's priority so the holder can run and release the lock sooner; it does not make the whole design deterministic.",
        },
      ],
      visual: {
        show: true,
        mode: "math",
        reason:
          "A shared timing axis can show ideal starts, actual starts, execution spans, one overrun, and the distinction between jitter and deadline miss at a glance.",
      },
    },
    {
      dayId: 27,
      mentalModel:
        "Debugging tools are different kinds of evidence: a sanitizer catches a rule violation, a profiler measures where time went, a replay recreates chosen inputs, and CI checks that the evidence still holds after a change.",
      explanation: [
        "C++ can compile code that later reads outside an array, uses an object after its lifetime, overflows a signed integer, or races on shared memory. Compiler sanitizers instrument a test build so some of these mistakes produce a precise report. AddressSanitizer targets memory errors such as out-of-bounds access and use-after-free. UndefinedBehaviorSanitizer checks selected invalid language operations. ThreadSanitizer detects many data races in instrumented code. They have runtime and memory cost, platform limitations, and different coverage, so run supported configurations in testing and do not assume one clean sanitizer run proves the absence of defects.",
        "A profiler answers a different question: where did CPU time, allocations, blocking, or system calls occur during the measured run? Start with a concrete symptom and use the target-appropriate tool. A function appearing at the top of a CPU profile is not automatically a bug; it may perform necessary work. Compare against the deadline and call path, then change one cause and remeasure. For timing-sensitive robotics code, instrumentation itself can perturb results, so preserve the profiler configuration and confirm the final timing with a production-like build.",
        "Deterministic replay records the inputs and context needed to exercise downstream behavior again: source timestamps, sequence numbers, payload bytes or parsed values, configuration, calibration identity, software revision, random seed where relevant, and terminal outcome. Replay cannot recreate electrical noise, kernel scheduling, bus contention, or a device fault unless those effects were captured or explicitly injected. It is nevertheless powerful because a failure that once depended on live timing can become a stable regression case for parsing, filtering, control decisions, and error handling.",
        "Continuous integration is the repeatable gate that configures a clean build, compiles supported targets, runs tests and selected analysis, and preserves reports. It does not replace review, target hardware, long-duration timing, or system validation. Give every event a monotonic timestamp, sequence number, severity, subsystem, outcome, and correlation identifier so logs can be joined without guessing. Avoid logging secrets or unbounded raw sensor data. A useful failure record lets another engineer answer what input arrived, which code and configuration ran, what state was believed, what command was proposed, what safety rule changed it, and how the run ended.",
      ],
      keyTerms: [
        {
          term: "Sanitizer",
          meaning:
            "Compiler-added test instrumentation that detects selected memory, undefined-behavior, or concurrency defects at runtime.",
          physicalExample:
            "AddressSanitizer identifies that packet parsing read one byte past a fixed buffer.",
        },
        {
          term: "Profiler",
          meaning:
            "A measurement tool that attributes time, allocations, blocking, or other costs to code paths during a run.",
          physicalExample:
            "A profile shows image conversion consuming most of a camera callback's CPU budget.",
        },
        {
          term: "Deterministic replay",
          meaning:
            "Re-execution of saved inputs and relevant context to reproduce downstream program behavior.",
          physicalExample:
            "A timestamped packet file reproduces the parser failure that occurred at command sequence 417.",
        },
        {
          term: "Structured event",
          meaning:
            "A log record with named fields and consistent types rather than an unparseable sentence.",
          physicalExample:
            "A watchdog event stores monotonic time, command sequence, age in ms, limit, action, and run ID.",
        },
        {
          term: "CI gate",
          meaning:
            "An automated clean-environment check that blocks a change when declared builds, tests, or analysis fail.",
          physicalExample:
            "A pull request cannot merge when the sanitizer replay job reproduces an out-of-bounds read.",
        },
      ],
      physicalExamples: [
        {
          title: "Black-box event recorder",
          scenario:
            "After a rover stops unexpectedly, sequence-linked sensor, state, command, and watchdog records reconstruct the decision without relying on memory.",
          lookFor:
            "The recorder preserves causal fields and configuration while avoiding claims about physical effects it did not measure.",
        },
        {
          title: "Slow station on an assembly line",
          scenario:
            "Watching the final queue shows a delay, but timing each station reveals that image conversion—not motor command generation—uses the budget.",
          lookFor:
            "Profiling localizes measured cost; it does not by itself explain why the implementation is costly or whether the work is necessary.",
        },
      ],
      workedExample: {
        title: "Turn one corrupted packet into a regression gate",
        setup:
          "A live run crashed after packet 417. The recorded packet declares a payload length of 12 bytes but contains only 8.",
        steps: [
          "Preserve the exact packet bytes, source and monotonic timestamps, sequence 417, parser configuration, and software revision.",
          "Run the parser test with AddressSanitizer and confirm the report points to a read beyond the captured buffer.",
          "Add an explicit length check before accessing the payload and return a typed malformed-packet result.",
          "Replay valid neighbouring packets and the malformed packet; verify valid outputs are unchanged and packet 417 is rejected.",
          "Record the rejection as a structured event containing expected length, actual length, sequence, and outcome without dumping sensitive payloads.",
          "Add the clean build, tests, and supported sanitizer run to CI and preserve the report for a deliberately failing pre-fix revision.",
        ],
        result:
          "The captured trigger no longer crashes the parser, malformed input has an explicit outcome, and the defect returns as a failing automated gate if reintroduced.",
        takeaway:
          "The repair chain is strongest when trigger, detector, code change, behavior check, and clean-environment gate all point to the same defect.",
      },
      handsOn: {
        setup:
          "Use a toy packet parser in an isolated local project. Deliberately introduce an out-of-bounds read only in this disposable exercise and never run the broken binary near hardware.",
        steps: [
          "Create one valid and one truncated byte vector with fixed sequence numbers.",
          "Build the toy parser with debug symbols and the compiler's supported address sanitizer configuration.",
          "Run the truncated input, save the sanitizer summary and non-zero result, and identify the invalid access.",
          "Add a bounds check and an explicit parse outcome, then rerun both inputs under the same instrumentation.",
          "Add structured JSON or key-value event output with run, sequence, expected length, actual length, and outcome.",
          "Create a clean CI-style command that configures, builds, tests, and runs the replay from an empty build directory.",
          "Write a limitation note naming one hardware or timing fault that this replay cannot reproduce.",
        ],
        observe:
          "The sanitizer explains a selected memory defect, while replay makes its trigger repeatable and the clean command makes the repair reviewable.",
        doneWhen:
          "The pre-fix case fails with relevant evidence, the repaired valid and truncated cases pass with explicit outcomes, and one command reproduces the clean gate.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_PHYSICAL_AI],
        workExample:
          "Convert a field crash or bad model input into a versioned replay scenario with sanitizer or profiler evidence, structured outcomes, and a CI regression gate.",
        interviewPrompt:
          "A deterministic replay passes after a crash fix. Explain exactly what it proves, what live timing and hardware faults it cannot prove, and which sanitizer, profiling, CI, and target tests you would add.",
      },
      commonMistakes: [
        {
          mistake: "Treating a clean AddressSanitizer run as proof that the program has no memory or concurrency defects.",
          correction:
            "It detects selected defects only on exercised, instrumented paths; combine tools, tests, review, and target validation while stating coverage.",
        },
        {
          mistake: "Optimizing the hottest function without connecting it to a requirement.",
          correction:
            "Relate the profile to an observed deadline, resource, or throughput limit, make one controlled change, and remeasure.",
        },
        {
          mistake: "Saving only payload bytes and calling the run deterministic.",
          correction:
            "Also preserve order, source and monotonic timing, configuration, calibration identity, revision, seeds where relevant, and terminal outcome.",
        },
      ],
      checkQuestions: [
        {
          question: "What is the difference between a sanitizer and a profiler?",
          answer:
            "A sanitizer detects selected program-rule violations in instrumented execution; a profiler measures where resources such as time or allocations were spent.",
        },
        {
          question: "Why does replaying captured sensor values not prove the live sensor path is fixed?",
          answer:
            "Replay can exercise downstream behavior but does not recreate device electrical behavior, driver timing, permissions, bus contention, or uncaptured faults.",
        },
        {
          question: "What should a useful structured watchdog event contain?",
          answer:
            "At minimum a monotonic timestamp, run or correlation ID, command sequence, measured age, configured limit, resulting action, and outcome.",
        },
      ],
      visual: {
        show: false,
        mode: "failure",
        reason:
          "The worked evidence chain already gives a concrete sequence; another generic proof-pipeline graphic would repeat material used elsewhere in the course.",
      },
    },
    {
      dayId: 28,
      mentalModel:
        "The repository is a small flight recorder and test rig, not just a program: it must show what entered, what decision was made, whether the output stayed inside its limits, how the run stopped, and how another engineer can repeat it.",
      explanation: [
        "The week's deliverable is one complete sensor-to-controller pipeline built from the boundaries you designed. A source produces timestamped samples; validation rejects malformed or stale data; a filter produces a measured state; a controller compares that state with a setpoint; a limiter constrains the proposed command; a sink records or safely delivers it; and an event recorder preserves the outcome. Keep the first version one-dimensional and simulated. The hiring value comes from reliability evidence, not from pretending that a console program controls a full robot.",
        "Define the operating contract before implementation. State sample unit and clock, nominal rate, maximum accepted age, control period, command range, queue capacity, overload policy, cancellation deadline, and terminal safe state. A watchdog should convert missing fresh input into an explicit bounded outcome rather than reusing an old command indefinitely. Every command record should distinguish requested, limited, delivered, and observed values. In the simulated build, delivered means accepted by the fake sink—not physical motion—and the documentation must say so.",
        "Test the failure paths as deliberately as the normal path. Include a good replay, malformed sample, out-of-order sequence, stale timestamp, source disconnect, queue overflow, controller saturation, sink rejection, and stop request while work is waiting. Assertions should check outcomes and bounds, not sleep and hope. For timing, collect monotonic timestamps and report actual samples, deadline misses, command age, and shutdown time under a named load. A single successful run is a demonstration; repeated declared scenarios with artifacts are evidence.",
        "A reviewable repository contains the target graph, checked-in build preset, source and tests, replay fixtures small enough to inspect, CI configuration, README, architecture and ownership note, timing report, sample structured events, and limitations. The README should lead a new engineer from prerequisites to clean configure, build, test, normal run, failure replay, and report interpretation. Do not hide failed trials. Close the chapter by explaining how RAII, value boundaries, Linux identity, bounded concurrency, instrumentation, and replay each remove a different class of uncertainty.",
      ],
      keyTerms: [
        {
          term: "Operating contract",
          meaning:
            "The declared units, clocks, rates, freshness limits, capacities, deadlines, ranges, failure actions, and terminal state of a component or pipeline.",
          physicalExample:
            "Wheel samples are rad/s on a monotonic clock at 50 Hz and become stale after 60 ms.",
        },
        {
          term: "Watchdog",
          meaning:
            "A mechanism that detects missing or late progress and triggers a predefined bounded response.",
          physicalExample:
            "If no fresh command arrives for 100 ms, the fake motor sink records a zero-command timeout state.",
        },
        {
          term: "Backpressure",
          meaning:
            "A deliberate response when producers offer work faster than consumers can safely process it.",
          physicalExample:
            "A capacity-4 control queue rejects new configuration work instead of allowing unbounded command delay.",
        },
        {
          term: "Deterministic fixture",
          meaning:
            "A fixed, versioned input and context bundle used to reproduce a particular program path.",
          physicalExample:
            "A CSV contains source time, sequence, measured speed, validity, setpoint, and expected terminal outcome.",
        },
        {
          term: "Acceptance criterion",
          meaning:
            "A measurable pass or fail condition declared before evaluating the run.",
          physicalExample:
            "All commands remain within [-1,1], stale input reaches zero output within 100 ms, and shutdown completes within 200 ms.",
        },
      ],
      physicalExamples: [
        {
          title: "Elevator controller record",
          scenario:
            "The controller logs requested floor, sensed position, door interlock, limited motor command, and terminal state for each run.",
          lookFor:
            "A command request is kept separate from interlock approval and observed movement, just as the project separates proposed, limited, delivered, and observed state.",
        },
        {
          title: "Kitchen order rail with four slots",
          scenario:
            "When every slot is full, the kitchen must stop accepting orders, replace an older order by policy, or redirect work; stacking paper without limit only hides overload.",
          lookFor:
            "A bounded queue makes overload visible and forces a choice tied to freshness, completeness, and safety.",
        },
      ],
      workedExample: {
        title: "Follow a stale sample to a safe terminal outcome",
        setup:
          "The pipeline runs every 20 ms. Its newest wheel-speed sample is 85 ms old, while the freshness limit is 60 ms and the previous delivered command was +0.35.",
        steps: [
          "Read source and current monotonic timestamps in the same clock domain and compute age: 85 ms.",
          "Compare age with the 60 ms contract and classify the input as stale before filtering or control.",
          "Do not reuse +0.35; create a stale-input outcome carrying sequence, measured age, and configured limit.",
          "Pass the predefined zero or inactive command through the same limiter and fake sink used by normal commands.",
          "Record requested prior command, safety-modified command, sink acceptance, watchdog reason, and run ID as separate fields.",
          "Measure elapsed time from freshness violation detection to the recorded safe terminal output.",
          "Replay the fixture and assert that the stale outcome, bounded command, fields, and response deadline remain unchanged.",
        ],
        result:
          "The pipeline converts an old observation into an explicit, replayable zero-output outcome instead of silently continuing with a stale command.",
        takeaway:
          "Failure handling belongs in the normal typed data path so it can be bounded, logged, replayed, and tested.",
      },
      handsOn: {
        setup:
          "Build and publish locally the simulated C++ repository; use a fake command sink or an unpowered indicator only, never an uncontrolled motor.",
        steps: [
          "Write the operating contract and acceptance table before the final implementation run.",
          "Implement timestamped source, validation, filter, controller, limiter, fake sink, watchdog, structured recorder, and bounded shutdown using narrow interfaces and RAII owners.",
          "Create CMake targets for production libraries, the pipeline executable, and tests; add a shared preset and clean build instructions.",
          "Add replay fixtures for nominal, malformed, out-of-order, stale, overflow, saturated, rejected-sink, and cancel-while-waiting cases.",
          "Run supported sanitizers on tests, then collect at least 1,000 timing cycles under declared idle and background-load conditions.",
          "Configure CI to run a clean build, tests, selected instrumentation, and deterministic replays while retaining concise reports.",
          "Ask another engineer or use a new empty checkout-equivalent folder to follow the README, then fix every undocumented step they encounter.",
        ],
        observe:
          "The same production calculations serve live-simulated and replay paths, while each failure has a typed outcome, bounded command, timing record, and repeatable gate.",
        doneWhen:
          "A clean environment follows one documented path to build and pass all declared scenarios; the report includes raw counts and tails, shutdown is bounded, failure artifacts remain visible, and limitations clearly state that fake-sink acceptance is not physical-actuation proof.",
      },
      jobConnection: {
        roles: [ROLE_VALIDATION, ROLE_SOFTWARE, ROLE_INTEGRATION, ROLE_HMI, ROLE_FLEET],
        workExample:
          "Present a repository that demonstrates the production C++ and Linux proof missing from the current portfolio: typed contracts, deterministic build, bounded runtime, observable failures, replay, and CI.",
        interviewPrompt:
          "Walk through your pipeline from timestamped sample to terminal command. Then explain ownership, queue policy, stale-data behavior, shutdown, measured timing, replay coverage, and the strongest claim the fake sink does not support.",
      },
      commonMistakes: [
        {
          mistake: "Calling the project complete when the normal demo prints correct commands once.",
          correction:
            "Predeclare and repeat normal, malformed, stale, overload, saturation, sink-failure, cancellation, and clean-build acceptance scenarios.",
        },
        {
          mistake: "Logging one final command without its source age or safety changes.",
          correction:
            "Record correlated source, requested, limited, delivered, and observed states with timestamps and the reason for each modification.",
        },
        {
          mistake: "Claiming real-time or hardware control from a desktop fake-sink run.",
          correction:
            "Report the measured platform and conditions precisely; fake-sink tests prove software behavior for those fixtures, not physical timing, drivers, or actuator response.",
        },
      ],
      checkQuestions: [
        {
          question: "Why must the pipeline record requested and limited commands separately?",
          answer:
            "It shows what policy proposed, what the safety or range boundary allowed, and whether a limit or stale-data rule changed the command.",
        },
        {
          question: "What is the correct response when a bounded queue is full?",
          answer:
            "Apply the predeclared policy—reject, drop a chosen item, block for a bounded time, or enter a safe state—and record the outcome; never grow without limit by accident.",
        },
        {
          question: "What is the strongest honest claim after all fake-sink replay tests pass?",
          answer:
            "The tested software build produces the declared bounded outcomes for the captured fixtures and environment; live device, target timing, electrical behavior, and physical motion still require integration and hardware validation.",
        },
      ],
      visual: {
        show: false,
        mode: "concept",
        reason:
          "The course already contains many generic pipeline and evidence diagrams; the acceptance table, structured records, and repository artifacts are the more useful proof for this capstone day.",
      },
    },
  ],
} satisfies ChapterContent;
