import { scheduledJobs, scheduleJob } from "node-schedule";
import prisma from "../prisma/client.js";
import { exec } from 'child_process';

class CronController {
  constructor() {
    this.create = this.create.bind(this);
  }
  async get(req, res) {
    const data = await prisma.cron.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return res.json({ message: 'Berhasil', data });
  }
  async create(req, res) {
    const { name, schedule, command } = req.body;
    console.log({ name, schedule, command })
    if (!name || !schedule || !command) return res.status(400).json({ message: 'Input tidak valid' });
    const data = await prisma.cron.create({ data: { name, schedule, command } });
    this.invokeCron(data);
    return res.json({ message: 'Berhasil menambahkan data', data });
  }
  async update(req, res) {
    const { id } = req.params;
    const { name, schedule, command } = req.body;
    if (!id || !name || !schedule || !command) return res.status(400).json({ message: 'Input tidak valid' });
    const job = scheduledJobs[id];
    if (!job) return res.status(404).json({ message: "Cron tidak ditemukan" });
    await prisma.cron.update({ where: { id }, data: { name, schedule, command } });
    await job.reschedule(schedule);
    job.job = () => {
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`executed: ${command}`);
      });
    }
    return res.json({ message: 'Berhasil mengubah' });
  }
  async delete(req, res) {
    const { id } = req.params
    if (!id) return res.status(401).json({ message: "Input tidak valid" })
    const cron = scheduledJobs[id]
    if (!cron) return res.status(404).json({ message: "Cron tidak ditemukan" })
    await prisma.cron.delete({ where: { id } })
    cron.cancel()
    await cron.deleteFromSchedule()
    return res.status(204).json({ message: 'Berhasil menghapus' });
  }
  async invokeCrons() {
    const data = await prisma.cron.findMany();
    data.forEach((item) => {
      this.invokeCron(item);
    });
  }
  invokeCron(cron) {
    return scheduleJob(cron.id, cron.schedule, () => {
      exec(cron.command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`executed: ${cron.command}`);
      });
    });
  }
}

export default new CronController();