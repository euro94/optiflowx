import React, { useState, useEffect } from 'react';
import { renderCombinedMatrix } from './CombinedMatrix';

const OptiFlowX = () => {
  // Define state for the component
  const [tasks, setTasks] = useState([
    {
      id: "1",
      name: "Complete project proposal",
      description: "Finish the draft and send for review",
      priority: "a",
      category: "work",
      status: "todo",
      dueDate: new Date().toISOString().split('T')[0], // Today
      timeBlock: null,
      oneThreeFive: "major",
      estimatedHours: 2
    },
    {
      id: "2",
      name: "Weekly team meeting",
      description: "Discuss project progress",
      priority: "b",
      category: "work",
      status: "todo",
      dueDate: new Date().toISOString().split('T')[0], // Today
      timeBlock: null,
      oneThreeFive: "medium",
      estimatedHours: 1
    },
    {
      id: "3",
      name: "Fix critical bug",
      description: "Authentication issue affecting users",
      priority: "a",
      category: "work",
      status: "inProgress",
      dueDate: new Date().toISOString().split('T')[0], // Today
      timeBlock: null,
      oneThreeFive: "medium",
      estimatedHours: 3
    },
    {
      id: "4",
      name: "Plan weekly meals",
      description: "Prepare grocery list",
      priority: "c",
      category: "personal",
      status: "completed",
      dueDate: "",
      timeBlock: null,
      oneThreeFive: "small",
      estimatedHours: 0.5
    },
    {
      id: "5",
      name: "Schedule doctor appointment",
      description: "Annual checkup",
      priority: "b",
      category: "health",
      status: "todo",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // 2 days from now
      timeBlock: null,
      oneThreeFive: "medium",
      estimatedHours: 0.25
    }
  ]);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [newTaskText, setNewTaskText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [showAddConfirmation, setShowAddConfirmation] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  // Categories with colors
  const categories = [
    { id: "work", name: "Work", color: "bg-blue-100 text-blue-800" },
    { id: "personal", name: "Personal", color: "bg-green-100 text-green-800" },
    { id: "health", name: "Health", color: "bg-red-100 text-red-800" },
    { id: "learning", name: "Learning", color: "bg-purple-100 text-purple-800" }
  ];

  // Priority levels (ABCDE Method)
  const priorities = [
    { id: "a", name: "A - Most Important", color: "bg-red-100 text-red-800" },
    { id: "b", name: "B - Important", color: "bg-orange-100 text-orange-800" },
    { id: "c", name: "C - Nice to do", color: "bg-yellow-100 text-yellow-800" },
    { id: "d", name: "D - Delegate", color: "bg-blue-100 text-blue-800" },
    { id: "e", name: "E - Eliminate", color: "bg-gray-100 text-gray-800" }
  ];

  // Status options
  const statuses = [
    { id: "todo", name: "To Do", color: "bg-gray-100" },
    { id: "inProgress", name: "In Progress", color: "bg-blue-100" },
    { id: "completed", name: "Completed", color: "bg-green-100" },
    { id: "delegated", name: "Delegated", color: "bg-purple-100" }
  ];

  // 1-3-5 Options
  const oneThreeFiveOptions = [
    { id: "major", name: "Major Task (1)", description: "One big important task for the day" },
    { id: "medium", name: "Medium Task (3)", description: "Three medium priority tasks" },
    { id: "small", name: "Small Task (5)", description: "Five small quick tasks" }
  ];

  // Available method tabs
  const methods = [
    { id: "dashboard", name: "Dashboard" },
    { id: "eisenhower", name: "Eisenhower Matrix" },
    { id: "abcde", name: "ABCDE Method" },
    { id: "combined", name: "Combined Matrix" },
    { id: "kanban", name: "Kanban Board" },
    { id: "howto", name: "How to Use" },
    { id: "profile", name: "Profile & Analytics" }
  ];

  // Get tasks for 1-3-5 Method and check limits
  const getOneThreeFiveTasks = (date = new Date().toISOString().split('T')[0]) => {
    // Get tasks for the specific date
    const dayTasks = tasks.filter(t => t.dueDate === date);
    
    // Get tasks by their manually assigned 1-3-5 category for this day
    const majorTasks = dayTasks.filter(t => t.oneThreeFive === 'major');
    const mediumTasks = dayTasks.filter(t => t.oneThreeFive === 'medium');
    const smallTasks = dayTasks.filter(t => t.oneThreeFive === 'small');
    
    // Check for limits
    const majorLimit = 1;
    const mediumLimit = 3;
    const smallLimit = 5;
    
    const majorExceeded = majorTasks.length > majorLimit;
    const mediumExceeded = mediumTasks.length > mediumLimit;
    const smallExceeded = smallTasks.length > smallLimit;
    
    return {
      majorTasks: majorTasks.slice(0, majorLimit),
      mediumTasks: mediumTasks.slice(0, mediumLimit),
      smallTasks: smallTasks.slice(0, smallLimit),
      majorExceeded,
      mediumExceeded,
      smallExceeded,
      totalMajor: majorTasks.length,
      totalMedium: mediumTasks.length,
      totalSmall: smallTasks.length
    };
  };
  
  // Check if adding/updating a task would exceed 1-3-5 limits
  const validateOneThreeFive = (task) => {
    const today = task.dueDate;
    const { totalMajor, totalMedium, totalSmall } = getOneThreeFiveTasks(today);
    
    // If this is an existing task with the same category, it doesn't count against the limit
    const isExistingTask = tasks.some(t => t.id === task.id && t.oneThreeFive === task.oneThreeFive && t.dueDate === task.dueDate);
    
    if (task.oneThreeFive === 'major' && totalMajor >= 1 && !isExistingTask) {
      return {
        valid: false,
        message: "You already have 1 major task for this day. Adding more will move them to the next available day."
      };
    }
    
    if (task.oneThreeFive === 'medium' && totalMedium >= 3 && !isExistingTask) {
      return {
        valid: false,
        message: "You already have 3 medium tasks for this day. Adding more will move them to the next available day."
      };
    }
    
    if (task.oneThreeFive === 'small' && totalSmall >= 5 && !isExistingTask) {
      return {
        valid: false,
        message: "You already have 5 small tasks for this day. Adding more will move them to the next available day."
      };
    }
    
    return { valid: true };
  };
  
  // Get next available day for a task category
  const getNextAvailableDay = (category, startDate) => {
    let currentDate = new Date(startDate);
    let dateStr = currentDate.toISOString().split('T')[0];
    let { totalMajor, totalMedium, totalSmall } = getOneThreeFiveTasks(dateStr);
    
    // Check if current day has room
    if ((category === 'major' && totalMajor < 1) ||
        (category === 'medium' && totalMedium < 3) ||
        (category === 'small' && totalSmall < 5)) {
      return dateStr;
    }
    
    // Keep checking next days until we find an available slot
    let maxIterations = 14; // To prevent infinite loop, max 2 weeks
    let iterations = 0;
    
    while (iterations < maxIterations) {
      currentDate.setDate(currentDate.getDate() + 1);
      dateStr = currentDate.toISOString().split('T')[0];
      
      let dayStats = getOneThreeFiveTasks(dateStr);
      
      if ((category === 'major' && dayStats.totalMajor < 1) ||
          (category === 'medium' && dayStats.totalMedium < 3) ||
          (category === 'small' && dayStats.totalSmall < 5)) {
        return dateStr;
      }
      
      iterations++;
    }
    
    // If all days are full, just return the next day
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toISOString().split('T')[0];
  };

  // Save data to localStorage
  const saveData = () => {
    try {
      localStorage.setItem('optiflowx-tasks', JSON.stringify(tasks));
      setShowSaveIndicator(true);
      
      // Hide the save indicator after 2 seconds
      setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };
  
  // Load data from localStorage
  const loadData = () => {
    try {
      const savedTasks = localStorage.getItem('optiflowx-tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  };
  
  // Auto-save on tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      saveData();
    }
  }, [tasks]);
  
  // Load data on initial render
  useEffect(() => {
    loadData();
  }, []);

  // Add a new task
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    // Parse priority from text (e.g., "a: Complete task" sets priority to 'a')
    let priority = "b"; // Default to B priority (Decide quadrant)
    let taskName = newTaskText.trim();
    
    // Check for priority prefix
    const priorityMatch = taskName.match(/^([a-e]):\s*(.*)/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase();
      taskName = priorityMatch[2].trim();
    }
    
    // Set default oneThreeFive based on priority
    const oneThreeFiveCategory = priority === "a" ? "major" : (priority === "b" ? "medium" : "small");
    
    // Set default values
    const today = new Date().toISOString().split('T')[0];
    
    // Create the new task
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      description: "",
      priority: priority, 
      category: "work",
      status: "todo",
      dueDate: today,
      timeBlock: null,
      oneThreeFive: oneThreeFiveCategory,
      estimatedHours: 1 
    };
    
    // Check if this would exceed 1-3-5 limits and adjust date if needed
    const validation = validateOneThreeFive(newTask);
    if (!validation.valid) {
      // Move to next available day
      newTask.dueDate = getNextAvailableDay(newTask.oneThreeFive, today);
    }
    
    // Add task and show confirmation notecard
    setTasks([...tasks, newTask]);
    setPendingTask(newTask);
    setShowAddConfirmation(true);
    setNewTaskText("");
    
    // Auto-hide the confirmation after 3 seconds
    setTimeout(() => {
      setShowAddConfirmation(false);
      setPendingTask(null);
    }, 3000);
  };

  // Update task
  const updateTask = () => {
    if (!currentTask) return;
    
    // Check if the updated task would violate 1-3-5 limits
    const validation = validateOneThreeFive(currentTask);
    
    if (!validation.valid) {
      // If category changed or date changed, and would exceed limits
      const originalTask = tasks.find(t => t.id === currentTask.id);
      const categoryChanged = originalTask.oneThreeFive !== currentTask.oneThreeFive;
      const dateChanged = originalTask.dueDate !== currentTask.dueDate;
      
      if (categoryChanged || dateChanged) {
        // Move to next available day
        currentTask.dueDate = getNextAvailableDay(currentTask.oneThreeFive, currentTask.dueDate);
        setValidationError(null); // Clear the error since we've handled it
      }
    } else {
      setValidationError(null); // No validation errors
    }
    
    // Update the task
    setTasks(tasks.map(task => 
      task.id === currentTask.id ? currentTask : task
    ));
    
    setShowModal(false);
    setCurrentTask(null);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId, isCompleted) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: isCompleted ? 'completed' : 'todo' } : task
    ));
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Edit task (open modal)
  const editTask = (task) => {
    setCurrentTask({...task});
    setShowModal(true);
  };

  // Start/pause pomodoro timer
  const togglePomodoro = () => {
    setPomodoroActive(!pomodoroActive);
  };

  // Get category/priority/status by ID
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };
  
  const getPriorityById = (priorityId) => {
    return priorities.find(pri => pri.id === priorityId) || priorities[2];
  };
  
  const getStatusById = (statusId) => {
    return statuses.find(s => s.id === statusId) || statuses[0];
  };

  // Get tasks for Eisenhower Matrix
  const getEisenhowerTasks = () => {
    // Do: Urgent & Important (Priority A)
    const doTasks = tasks.filter(t => t.priority === 'a' && t.status !== 'completed');
    
    // Decide: Not Urgent but Important (Priority B)
    const decideTasks = tasks.filter(t => t.priority === 'b' && t.status !== 'completed');
    
    // Delegate: Urgent but Not Important (Priority C or D)
    const delegateTasks = tasks.filter(t => (t.priority === 'c' || t.priority === 'd') && t.status !== 'completed');
    
    // Delete: Not Urgent & Not Important (Priority E)
    const deleteTasks = tasks.filter(t => t.priority === 'e' && t.status !== 'completed');
    
    return { doTasks, decideTasks, delegateTasks, deleteTasks };
  };

  // Get stats
  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    return { total, completed, inProgress, todo };
  };

  // Generate Time Blocks based on 1-3-5 Method tasks
  const generateTimeBlocks = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Fixed lunch break
    const lunchBlock = { 
      id: "lunch",
      time: "11:30am - 12:30pm", 
      activity: "Lunch Break", 
      description: "Rest and recharge", 
      color: "bg-green-200",
      fixed: true,
      taskId: null
    };
    
    // Create time block structure
    const timeBlocks = [
      { 
        id: "morning1",
        time: "8:30am - 10:30am", 
        activity: "Deep Work", 
        description: "Focus on most important task", 
        color: "bg-red-200",
        taskId: null,
        fixed: false
      },
      { 
        id: "morning2",
        time: "10:30am - 11:30am", 
        activity: "Important Work", 
        description: "Continue priority tasks", 
        color: "bg-orange-200",
        taskId: null,
        fixed: false
      },
      lunchBlock,
      { 
        id: "afternoon1",
        time: "12:30pm - 2:00pm", 
        activity: "Medium Priority", 
        description: "Work on important but less urgent tasks", 
        color: "bg-yellow-200",
        taskId: null,
        fixed: false
      },
      { 
        id: "afternoon2",
        time: "2:00pm - 3:30pm", 
        activity: "Team Collaboration", 
        description: "Meetings and coordination", 
        color: "bg-blue-200",
        taskId: null,
        fixed: false
      }
    ];
    
    // Get tasks from the 1-3-5 Method
    const { majorTasks, mediumTasks, smallTasks } = getOneThreeFiveTasks();
    
    // Assign major task (if any) to morning Deep Work slot
    if (majorTasks.length > 0 && majorTasks[0].status !== 'completed') {
      const majorTask = majorTasks[0];
      const blockIndex = timeBlocks.findIndex(block => block.id === "morning1");
      if (blockIndex !== -1) {
        timeBlocks[blockIndex].activity = majorTask.name;
        timeBlocks[blockIndex].description = majorTask.description || timeBlocks[blockIndex].description;
        timeBlocks[blockIndex].taskId = majorTask.id;
      }
    }
    
    // Distribute medium tasks across morning2 and afternoon1 slots
    const availableMediumSlots = ["morning2", "afternoon1"];
    mediumTasks.forEach((task, index) => {
      if (index < availableMediumSlots.length && task.status !== 'completed') {
        const slotId = availableMediumSlots[index];
        const blockIndex = timeBlocks.findIndex(block => block.id === slotId);
        if (blockIndex !== -1) {
          timeBlocks[blockIndex].activity = task.name;
          timeBlocks[blockIndex].description = task.description || timeBlocks[blockIndex].description;
          timeBlocks[blockIndex].taskId = task.id;
        }
      }
    });
    
    return timeBlocks;
  };
  
  const timeBlocks = generateTimeBlocks();

  // 3-3-3 Method
  const threethreethreeMethod = [
    { category: "3 Hours", description: "Deep work", icon: "⏱️", color: "bg-red-200" },
    { category: "3 Tasks", description: "Essential tasks", icon: "📋", color: "bg-yellow-200" },
    { category: "3 Maintenance", description: "Admin/maintenance", icon: "⚙️", color: "bg-blue-200" }
  ];

  // Task Card component with more compact design
  const TaskCard = ({ task, onClick }) => (
    <div 
      className="bg-white p-2 rounded shadow hover:shadow-md cursor-pointer text-sm"
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-center mb-1">
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusById(task.status).color}`}>
          {getStatusById(task.status).name}
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
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getCategoryById(task.category).color}`}>
          {getCategoryById(task.category).name}
        </span>
        <span className="text-xs text-gray-500">{task.estimatedHours}h</span>
      </div>
    </div>
  );

  // Render Dashboard View
  const renderDashboard = () => {
    // Dashboard implementation...
    const { total, completed, inProgress, todo } = getStats();
    
    return (
      <div className="grid grid-cols-1 gap-6">
        {/* Dashboard content */}
      </div>
    );
  };

  // Render Eisenhower Matrix View
  const renderEisenhowerMatrix = () => {
    // Eisenhower matrix implementation...
    const { doTasks, decideTasks, delegateTasks, deleteTasks } = getEisenhowerTasks();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Eisenhower matrix content */}
      </div>
    );
  };

  // Render ABCDE Method View
  const renderABCDEMethod = () => {
    // ABCDE method implementation...
    const categorizedTasks = priorities.map(priority => ({
      ...priority,
      tasks: tasks.filter(task => task.priority === priority.id && task.status !== 'completed')
    }));
    
    return (
      <div className="space-y-6">
        {/* ABCDE method content */}
      </div>
    );
  };

  // Render Kanban Board View
  const renderKanbanBoard = () => {
    // Kanban board implementation...
    const columns = statuses.map(status => ({
      ...status,
      tasks: tasks.filter(task => task.status === status.id)
    }));
    
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {/* Kanban board content */}
      </div>
    );
  };

  // Effect for Pomodoro Timer
  useEffect(() => {
    let timer;
    
    if (pomodoroActive) {
      timer = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(pomodoroSeconds - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(pomodoroMinutes - 1);
          setPomodoroSeconds(59);
        } else {
          // Timer finished
          setPomodoroActive(false);
          alert('Pomodoro session completed!');
        }
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [pomodoroActive, pomodoroMinutes, pomodoroSeconds]);

  // Main Render
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold">OptiFlowX</div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Method Selection Tabs */}
        <div className="mb-6 bg-white rounded shadow p-2 flex overflow-x-auto">
          {methods.map(method => (
            <button
              key={method.id}
              className={`px-4 py-2 rounded mr-2 ${
                activeView === method.id 
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView(method.id)}
            >
              {method.name}
            </button>
          ))}
        </div>
        
        {/* Quick Add Task */}
        {(activeView !== 'howto' && activeView !== 'profile') && (
          <div className="mb-6 bg-white rounded shadow p-4">
            <div className="flex">
              <input
                type="text"
                className="flex-1 p-2 border rounded-l"
                placeholder="Add task... (tip: prefix with a, b, c, d, e: for priority)"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addTask()}
              />
              <button 
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2 rounded-r hover:opacity-90"
                onClick={addTask}
              >
                Add
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Tip: Type "a: Task name" to set priority A, "b: Task name" for B, etc.
            </div>
          </div>
        )}
        
        {/* Active View Content */}
        <div className="mb-6">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'eisenhower' && renderEisenhowerMatrix()}
          {activeView === 'abcde' && renderABCDEMethod()}
          {activeView === 'combined' && renderCombinedMatrix(tasks, editTask, getPriorityById)}
          {activeView === 'kanban' && renderKanbanBoard()}
        </div>
      </main>

      {/* Task Edit Modal */}
      {showModal && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="font-bold text-xl mb-4">Edit Task</h3>
            
            {validationError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p>{validationError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Modal content */}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    deleteTask(currentTask.id);
                    setShowModal(false);
                  }
                }}
              >
                Delete
              </button>
              <div>
                <button
                  className="bg-gray-200 px-4 py-2 rounded mr-2 hover:bg-gray-300"
                  onClick={() => {
                    setShowModal(false);
                    setValidationError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={updateTask}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Add Confirmation */}
      {showAddConfirmation && pendingTask && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 p-4 rounded shadow-lg max-w-md animate-fade-in">
          <div className="font-medium text-green-800 mb-1">Task Added!</div>
          <div className="text-sm">{pendingTask.name}</div>
          <div className="flex mt-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full mr-2 ${getPriorityById(pendingTask.priority).color}`}>
              {getPriorityById(pendingTask.priority).name.split(' ')[0]}
            </span>
            <span className={`px-2 py-0.5 rounded-full ${getCategoryById(pendingTask.category).color}`}>
              {getCategoryById(pendingTask.category).name}
            </span>
          </div>
        </div>
      )}
      
     {/* Save Indicator */}
      {showSaveIndicator && (
        <div className="fixed bottom-4 left-4 bg-indigo-100 border border-indigo-300 p-3 rounded shadow-lg flex items-center animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="text-indigo-800">Changes saved</div>
        </div>
      )}
    </div>
  );
};

export default OptiFlowX;
