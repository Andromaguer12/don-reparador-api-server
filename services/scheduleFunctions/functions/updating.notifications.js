const { sendNewNotificationTo } = require("../../../utils/utilsFunctions");
const { userDataRef, notificationsPosts } = require("../../Firebase/Firebase.firestore");

const sendUsersNotificationFunction = (type) =>
	new Promise(async (response, reject) => {
		const users = [];
		const posts = [];
		await userDataRef
			.where('auth', '==', type === 'user' ? 'user' : 'distributor')
			.get()
			.then((docs) => {
				docs.forEach((doc) => {
					users.push(doc.id)
				})
			})

		await notificationsPosts
			.where('bucket', '==', type)
			.get()
			.then((docs) => {
				docs.forEach((doc) => {
					if (doc.data().timestamp <= new Date().getTime() + 21600000) posts.push({ ...doc.data() })
				})
			})

		let count = 0;
		for await (let p of posts) {
			const { title, text } = p;
			for await (let u of users) {
				await sendNewNotificationTo(
					title,
					text,
					"system",
					null,
					type,
					null,
					u
				).then(() => {
					count++;
					if (count === users.length) {
						response("all ok")
					}
				})
			}
		}
	})

module.exports = {
	sendUsersNotificationFunction
}

