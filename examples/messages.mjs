import report from "../dist/index.js";

report.log("A normal message without any decoration");
report.info("An info message");
report.warn("This is a warning");
report.error("A plain error message");
report.success("Congratulations");
report.command('echo "some command"');

report.info(report.lang("savedNewDependencies", 53738));
