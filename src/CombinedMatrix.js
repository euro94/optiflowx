// Helper functions for the combined Eisenhower-ABCDE Matrix
export const isUrgentAndImportant = (task) => {
  // Priority A tasks are always important
  // Tasks are urgent if:
  // - They have a due date of today or earlier
  // - OR they're marked as "inProgress" with a due date of today or earlier
  return (
    task.priority === 'a' && 
    (
      (task.dueDate && new Date(task.dueDate) <= new Date()) || 
      task.status === 'inProgress'
    )
  );
};

export const isImportantNotUrgent = (task) => {
  // Priority A with future due date or Priority B tasks
  return (
    (task.priority === 'a' && (!task.dueDate || new Date(task.dueDate) > new Date())) ||
    task.priority === 'b'
  );
};

export const isUrgentNotImportant = (task) => {
  // Lower priority tasks (C or D) that are due today or earlier
  return (
    (task.priority === 'c' || task.priority === 'd') && 
    (task.dueDate && new Date(task.dueDate) <= new Date())
  );
};

export const isNotUrgentNotImportant = (task) => {
  // Priority E tasks or lower priority tasks (C or D) with future/no due date
  return (
    task.priority === 'e' || 
    (
      (task.priority === 'c' || task.priority === 'd') && 
      (!task.dueDate || new Date(task.dueDate) > new Date())
    )
  );
};

// Render Combined Eisenhower-ABCDE Matrix
export const renderCombinedMatrix = (tasks, editTask, getPriorityById) => {
  // Filter out completed tasks
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  
  // Define the four quadrants with their respective priority groups
  const quadrants = [
    {
      title: "Do: Urgent & Important",
      description: "Take action immediately",
      color: "bg-red-100",
      headerColor: "bg-red-200",
      icon: "🔥",
      groups: [
        {
          title: "A - Most Important",
          tasks: activeTasks.filter(t => t.priority === 'a' && isUrgentAndImportant(t)),
          bgColor: "bg-red-50",
          priority: "a"
        },
        {
          title: "Other Priorities",
          tasks: activeTasks.filter(t => t.priority !== 'a' && isUrgentAndImportant(t)),
          bgColor: "bg-red-50/50"
        }
      ]
    },
    {
      title: "Decide: Important but Not Urgent",
      description: "Schedule time for these",
      color: "bg-blue-100",
      headerColor: "bg-blue-200",
      icon: "📅",
      groups: [
        {
          title: "A - Future Important",
          tasks: activeTasks.filter(t => t.priority === 'a' && isImportantNotUrgent(t)),
          bgColor: "bg-blue-50",
          priority: "a"
        },
        {
          title: "B - Important",
          tasks: activeTasks.filter(t => t.priority === 'b' && isImportantNotUrgent(t)),
          bgColor: "bg-blue-50/70",
          priority: "b"
        }
      ]
    },
    {
      title: "Delegate: Urgent but Not Important",
      description: "Who can help with these?",
      color: "bg-yellow-100",
      headerColor: "bg-yellow-200",
      icon: "👥",
      groups: [
        {
          title: "C - Nice to Do",
          tasks: activeTasks.filter(t => t.priority === 'c' && isUrgentNotImportant(t)),
          bgColor: "bg-yellow-50",
          priority: "c"
        },
        {
          title: "D - Delegate",
          tasks: activeTasks.filter(t => t.priority === 'd' && isUrgentNotImportant(t)),
          bgColor: "bg-yellow-50/70",
          priority: "d"
        }
      ]
    },
    {
      title: "Delete: Not Urgent & Not Important",
      description: "Eliminate or postpone",
      color: "bg-gray-100",
      headerColor: "bg-gray-200",
      icon: "🗑️",
      groups: [
        {
          title: "E - Eliminate",
          tasks: activeTasks.filter(t => t.priority === 'e' && isNotUrgentNotImportant(t)),
          bgColor: "bg-gray-50",
          priority: "e"
        },
        {
          title: "C/D - Low Priority",
          tasks: activeTasks.filter(t => (t.priority === 'c' || t.priority === 'd') && isNotUrgentNotImportant(t)),
          bgColor: "bg-gray-50/50"
        }
      ]
    }
  ];
  
  // Calculate total tasks in each quadrant
  quadrants.forEach(q => {
    q.totalTasks = q.groups.reduce((sum, group) => sum + group.tasks.length, 0);
  });
  
  // Import the TaskCard component from the parent
  const TaskCard = ({ task, onClick }) => (
    <div 
      className="bg-white p-2 rounded shadow hover:shadow-md cursor-pointer text-sm"
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100">
          {task.status}
        </span>
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getPriorityById(task.priority).color}`}>
          {getPriorityById(task.priority).name.split(' ')[0]}
        </span>
      </div>
      <div className="font-medium truncate">{task.name}</div>
      {task.description && (
        <p className="text-xs text-gray-500 truncate">{task.description}</p>
      )}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
          {task.category}
        </span>
        <span className="text-xs text-gray-500">{task.estimatedHours}h</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold text-center">Eisenhower Matrix with ABCDE Priorities</h2>
        <p className="text-center text-sm text-gray-600 mb-4">Comprehensive prioritization combining both methodologies</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quadrants.map((quadrant, qIndex) => (
            <div key={qIndex} className={`${quadrant.color} p-4 rounded shadow-sm border border-gray-200`}>
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <span className={`${quadrant.headerColor} w-8 h-8 flex items-center justify-center rounded-full mr-2 text-lg`}>
                  {quadrant.icon}
                </span>
                {quadrant.title}
                <span className="ml-auto bg-white bg-opacity-60 text-sm px-2 py-1 rounded-full">
                  {quadrant.totalTasks}
                </span>
              </h3>
              <p className="text-sm mb-3 pl-10">{quadrant.description}</p>
              
              <div className="space-y-3">
                {quadrant.groups.map((group, gIndex) => (
                  <div key={gIndex} className={`${group.bgColor} p-3 rounded`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm border-b pb-1 mb-2 border-opacity-50 border-gray-400 flex-grow">
                        {group.title}
                      </h4>
                      {group.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityById(group.priority).color} ml-2`}>
                          {group.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {group.tasks.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {group.tasks.map(task => (
                          <TaskCard key={task.id} task={task} onClick={editTask} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-500 py-2">No tasks</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded shadow p-6">
        <h3 className="font-bold text-lg mb-4">Effectiveness Through Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <span className="bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full mr-2 text-sm">1</span>
              Eisenhower Matrix
            </h4>
            <p className="text-sm text-gray-700">Categorizes tasks based on urgency and importance, helping you decide what to do next.</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><span className="font-medium text-red-700">Do:</span> Urgent & important - immediate action</li>
              <li><span className="font-medium text-blue-700">Decide:</span> Important but not urgent - schedule</li>
              <li><span className="font-medium text-yellow-700">Delegate:</span> Urgent but not important - assign</li>
              <li><span className="font-medium text-gray-700">Delete:</span> Neither urgent nor important - eliminate</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <span className="bg-purple-100 w-6 h-6 flex items-center justify-center rounded-full mr-2 text-sm">2</span>
              ABCDE Method
            </h4>
            <p className="text-sm text-gray-700">Prioritizes tasks within categories for optimal sequence and focus.</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><span className="font-medium text-red-700">A:</span> Most important - significant consequences</li>
              <li><span className="font-medium text-orange-700">B:</span> Important - minor consequences</li>
              <li><span className="font-medium text-yellow-700">C:</span> Nice to do - no consequences</li>
              <li><span className="font-medium text-blue-700">D:</span> Delegate - better done by others</li>
              <li><span className="font-medium text-gray-700">E:</span> Eliminate - not worth your time</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded border border-indigo-100">
          <h4 className="font-medium mb-2 text-indigo-800">How to Use the Combined Matrix</h4>
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
            <li>
              <span className="font-medium">First, identify quadrant:</span> Determine if tasks are urgent, important, both, or neither
            </li>
            <li>
              <span className="font-medium">Then, check ABCDE priority:</span> Within each quadrant, handle A tasks before B, and so on
            </li>
            <li>
              <span className="font-medium">Work the system:</span> Focus on Do quadrant first, then Decide, only then consider Delegate and Delete
            </li>
            <li>
              <span className="font-medium">Adjust as needed:</span> Review and realign priorities as due dates approach or circumstances change
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
