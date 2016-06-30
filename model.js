/*

cache of

tasks: [
  {
	id: Number,
	state: String,
	bids: Number,
	comments: String,
	value: Number
  }
]

*/

const model = () => {
	const con = console;
	var listeners = {};
	var tasks = [];
	var taskIds = [];

	let trigger = (eventName, ...args) => {
		if (listeners[eventName]) {
			listeners[eventName].apply(null, args);
		} else {
			con.log("trigger, no event listener for", eventName);
		}
	}

	return {
		add: (task) => {
			var taskIndex = taskIds.indexOf(task.id);
			if (taskIndex == -1) {
				var colour = {
					r: ~~(50 + Math.random() * 205), //.toString(16),
					g: ~~(50 + Math.random() * 205), //.toString(16),
					b: ~~(50 + Math.random() * 205) //.toString(16)
				};
				task.colour = colour.r << 16 | colour.g << 8 | colour.b;
				taskIds.push(task.id);
				tasks.push(task);
				trigger("newtask", task);
			} else {
				var existingTask = tasks[taskIndex];
				var changed = false;
				if (existingTask.bids_count !== task.bids_count) {
					con.log(`task bids ${existingTask.bids_count} > ${task.bids_count}`);
					changed = true;
				}
				if (existingTask.comments_count !== task.comments_count) {
					con.log(`task comments ${existingTask.comments_count} > ${task.comments_count}`);
					changed = true;
				}
				if (changed) {
					trigger("changetask", task);
					tasks[taskIndex] = task;
				} else {
					con.log('same task, no change');
				}
			}
		},
		remove: (task) => {
			// con.log("model.remove - task.id", task.id, taskIds);
			var taskIndex = taskIds.indexOf(task.id);
			if (taskIndex == -1) {
				con.warn("tried to remove task from model, but it doesn't exist", task);
			} else {
				// disabled removing... want to leave this in cache so it doesn't reappear
				// taskIds.splice(taskIndex, 1);
				// tasks.splice(taskIndex, 1);
			}
		},
		tasks: () => {
			return tasks;
		},
		on: (eventName, callback) => {
			listeners[eventName] = callback;
		},
	}
}
